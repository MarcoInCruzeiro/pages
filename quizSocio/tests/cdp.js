/*
 * Cliente mínimo do Chrome DevTools Protocol para os testes de navegador.
 * Evita dependências externas: usa o Chrome instalado e o WebSocket nativo do
 * Node 22. Cada teste abre uma aba nova e fecha o processo ao final.
 */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const ANALYTICS_HOSTS = [
    'googletagmanager.com',
    'google-analytics.com',
    'analytics.google.com',
    'doubleclick.net',
    '/_vercel/insights/'
];

/*
 * Outros recursos externos que a página carrega (fontes do Google). Não são
 * coleta GA4, mas também não podem sair do navegador de teste: são
 * interceptados e falhados antes da transmissão, sem registrar tentativa de
 * coleta. A página renderiza com as fontes de fallback.
 */
const HOSTS_BLOQUEADOS = [
    'fonts.googleapis.com',
    'fonts.gstatic.com'
];

/*
 * Bloqueio permanente antes da transmissão: Fetch intercepta a requisição no
 * estágio Request. A existência de uma pausa é a evidência de tentativa de
 * coleta; a ausência de resposta HTTP, isoladamente, não prova ausência de
 * envio (QUIZ-016). Destinos bloqueados: coleta de analytics e navegação de
 * contratação (socio.cruzeiro.com.br).
 */
const CHECKOUT_HOST = 'socio.cruzeiro.com.br';

function analyticsUrlPatterns() {
    return ANALYTICS_HOSTS.map((host) => ({ urlPattern: `*${host}*`, requestStage: 'Request' }));
}

function isCheckoutUrl(url) {
    return url.includes(CHECKOUT_HOST);
}

function matchesAnalytics(url) {
    return ANALYTICS_HOSTS.some((host) => url.includes(host));
}

function matchesBloqueados(url) {
    return HOSTS_BLOQUEADOS.some((host) => url.includes(host));
}

function interceptionUrlPatterns() {
    return analyticsUrlPatterns()
        .concat(HOSTS_BLOQUEADOS.map((host) => ({ urlPattern: `*${host}*`, requestStage: 'Request' })))
        .concat([{ urlPattern: `*${CHECKOUT_HOST}*`, requestStage: 'Request' }]);
}

function getFreePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
    });
}

function httpJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class Page {
    constructor(wsUrl, process, profileDir, browserWsUrl = null, targetId = null) {
        this.wsUrl = wsUrl;
        this.process = process;
        this.profileDir = profileDir;
        this.browserWsUrl = browserWsUrl;
        this.targetId = targetId;
        this.ws = null;
        this.browserWs = null;
        this.nextId = 1;
        this.browserNextId = 100000;
        this.pending = new Map();
        this.browserPending = new Map();
        this.childSessions = new Map();
        this.events = new Map();
        // Tentativas observadas antes da transmissão, por tipo de destino:
        // coleta de analytics e navegação de contratação (checkout).
        this.analyticsAttempts = [];
        this.checkoutAttempts = [];
    }

    async connect() {
        this.ws = new WebSocket(this.wsUrl);
        await new Promise((resolve, reject) => {
            this.ws.addEventListener('open', resolve, { once: true });
            this.ws.addEventListener('error', reject, { once: true });
        });
        this.ws.addEventListener('message', (event) => {
            this.handleMessage(JSON.parse(event.data), this.pending, this.events);
        });
        await this.send('Page.enable');
        await this.send('Runtime.enable');
        // Analytics reais nunca recebem tráfego de teste: a interrupção ocorre
        // no estágio Request, antes da transmissão; gtag é substituído na página.
        this.analyticsResponses = [];
        this.on('Network.responseReceived', ({ response }) => {
            if (matchesAnalytics(response.url)) {
                this.analyticsResponses.push(response.url);
            }
        });
        await this.send('Network.enable');
        this.on('Fetch.requestPaused', ({ requestId, request, resourceType }) => {
            const url = request?.url || '';
            if (matchesAnalytics(url)) this.analyticsAttempts.push(url);
            // Só navegações (documento) são tentativa de contratação: a
            // própria página referencia imagens do site do checkout no
            // cabeçalho e no rodapé; elas também são bloqueadas, mas não
            // são tentativa de navegação.
            if (isCheckoutUrl(url) && resourceType === 'Document') this.checkoutAttempts.push(url);
            const bloqueado = matchesAnalytics(url) || isCheckoutUrl(url) || matchesBloqueados(url);
            const command = bloqueado ? 'Fetch.failRequest' : 'Fetch.continueRequest';
            const params = command === 'Fetch.failRequest' ? { requestId, errorReason: 'BlockedByClient' } : { requestId };
            this.send(command, params).catch(() => { /* requisição pode ter sido encerrada */ });
        });
        await this.send('Fetch.enable', { patterns: interceptionUrlPatterns() });
        if (this.browserWsUrl) await this.attachBrowserInterception();
    }

    /*
     * Sessão do navegador: auto-attach prende cada aba nova no renderizador
     * antes de rodar qualquer JavaScript (waitForDebuggerOnStart), permite
     * instalar Fetch nela e depois resume. Assim a navegação de contratação
     * e a coleta numa aba filha são observadas e bloqueadas antes de
     * qualquer transmissão. Nada carrega em aba filha: toda requisição é
     * falhada; o DNS (~NOTFOUND no host-resolver-rules) é a segunda barreira.
     */
    async attachBrowserInterception() {
        this.browserWs = new WebSocket(this.browserWsUrl);
        await new Promise((resolve, reject) => {
            this.browserWs.addEventListener('open', resolve, { once: true });
            this.browserWs.addEventListener('error', reject, { once: true });
        });
        this.browserWs.addEventListener('message', (event) => {
            this.handleBrowserMessage(JSON.parse(event.data));
        });
        await this.sendBrowser('Target.setAutoAttach', {
            autoAttach: true,
            waitForDebuggerOnStart: true,
            flatten: true
        });
    }

    sendBrowser(method, params = {}, sessionId = undefined) {
        const id = this.browserNextId++;
        return new Promise((resolve, reject) => {
            this.browserPending.set(id, { resolve, reject });
            this.browserWs.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
            setTimeout(() => {
                if (this.browserPending.has(id)) {
                    this.browserPending.delete(id);
                    reject(new Error(`Timeout em ${method}`));
                }
            }, 15000);
        });
    }

    handleBrowserMessage(message) {
        if (message.id && this.browserPending.has(message.id)) {
            const { resolve, reject } = this.browserPending.get(message.id);
            this.browserPending.delete(message.id);
            if (message.error) reject(new Error(JSON.stringify(message.error)));
            else resolve(message.result);
            return;
        }
        const sessionId = message.sessionId;
        // attachedToTarget traz o id da nova sessão em params.sessionId (o
        // campo de topo só existe em mensagens DENTRO de uma sessão).
        if (message.method === 'Target.attachedToTarget' && message.params?.sessionId) {
            this.onChildAttached(message.params.sessionId, message.params).catch(() => { /* aba pode fechar antes */ });
            return;
        }
        if (message.method === 'Fetch.requestPaused') {
            const requestId = message.params?.requestId;
            const url = message.params?.request?.url || '';
            if (matchesAnalytics(url)) this.analyticsAttempts.push(url);
            // Em aba filha, só a navegação em si (documento) é tentativa de
            // contratação; o resto seria subrecurso de uma página que nunca
            // chega a carregar.
            if (isCheckoutUrl(url) && message.params?.resourceType === 'Document') this.checkoutAttempts.push(url);
            // Em aba filha nada é legítimo: falha toda requisição.
            this.sendBrowser('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }, sessionId)
                .catch(() => { /* sessão pode encerrar */ });
        }
    }

    async onChildAttached(sessionId, params) {
        const targetId = params.targetInfo?.targetId;
        if (targetId !== this.targetId && params.targetInfo?.type === 'page') {
            this.childSessions.set(sessionId, { targetId });
            await this.sendBrowser('Fetch.enable', { patterns: interceptionUrlPatterns() }, sessionId);
        }
        await this.sendBrowser('Runtime.runIfWaitingForDebugger', {}, sessionId);
    }

    // Fecha as abas filhas que ficaram após a navegação interceptada.
    async closeChildTabs() {
        for (const { targetId } of this.childSessions.values()) {
            try {
                await this.sendBrowser('Target.closeTarget', { targetId });
            } catch (_) { /* noop */ }
        }
        this.childSessions.clear();
    }

    handleMessage(message, pending, eventRouting) {
        if (message.id && pending.has(message.id)) {
            const { resolve, reject } = pending.get(message.id);
            pending.delete(message.id);
            if (message.error) reject(new Error(JSON.stringify(message.error)));
            else resolve(message.result);
            return;
        }
        if (!message.method) return;
        const listeners = eventRouting.get(message.method) || [];
        listeners.forEach((listener) => listener(message.params));
    }

    on(method, listener) {
        const listeners = this.events.get(method) || [];
        listeners.push(listener);
        this.events.set(method, listeners);
        return () => {
            this.events.set(method, (this.events.get(method) || []).filter((item) => item !== listener));
        };
    }

    send(method, params = {}) {
        const id = this.nextId++;
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            this.ws.send(JSON.stringify({ id, method, params }));
            setTimeout(() => {
                if (this.pending.has(id)) {
                    this.pending.delete(id);
                    reject(new Error(`Timeout em ${method}`));
                }
            }, 15000);
        });
    }

    async evaluate(expression, awaitPromise = false) {
        const result = await this.send('Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise,
            userGesture: true
        });
        if (result.exceptionDetails) {
            const details = result.exceptionDetails;
            const description = details.exception?.description
                || details.exception?.value
                || details.text
                || 'Erro ao avaliar expressão';
            throw new Error(description);
        }
        return result.result.value;
    }

    async navigate(url) {
        // Espera o evento de carregamento da PRÓXIMA navegação (o readyState
        // do documento antigo já é "complete" e vazaria a resposta cedo).
        const carregou = new Promise((resolve) => {
            const desligar = this.on('Page.loadEventFired', () => {
                desligar();
                resolve();
            });
        });
        // Prazo de segurança caso a navegação falhe sem disparar o evento.
        const prazo = delay(15000).then(() => {});
        await this.send('Page.navigate', { url });
        await Promise.race([carregou, prazo]);
        await this.waitFor('document.readyState === "complete"', 15000);
    }

    async waitFor(expression, timeout = 8000) {
        const started = Date.now();
        let lastError = null;
        while (Date.now() - started < timeout) {
            try {
                if (await this.evaluate(`Boolean(${expression})`)) return true;
            } catch (error) {
                lastError = error;
            }
            await delay(50);
        }
        throw new Error(`Timeout esperando: ${expression}${lastError ? ` (${lastError.message})` : ''}`);
    }

    async screenshot(filePath) {
        const result = await this.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'));
    }

    async close() {
        try { this.ws?.close(); } catch (_) { /* noop */ }
        try { this.process.kill('SIGKILL'); } catch (_) { /* noop */ }
        await delay(100);
        try { fs.rmSync(this.profileDir, { recursive: true, force: true }); } catch (_) { /* noop */ }
    }
}

/*
 * Mapeamento de nomes para o Chrome resolver na máquina local: o host real de
 * produção (usado pelos testes que provam a inicialização no modo habilitado)
 * e um host remoto fictício, que deve permanecer FORA da coleta (configuração
 * explícita exigida pelo QUIZ-013). O host de contratação é resolvido como
 * NOTFOUND: qualquer navegação para o checkout — inclusive a aba aberta pelo
 * CTA — falha antes de qualquer transmissão, sem acesso à rede real.
 */
const TEST_HOST_RULES = [
    'MAP quiz-socio.vercel.app 127.0.0.1',
    'MAP remoto-teste.example 127.0.0.1',
    'MAP socio.cruzeiro.com.br ~NOTFOUND'
].join(',');

async function launchChrome({ chromePath = process.env.CHROME_PATH || 'google-chrome' } = {}) {
    const port = await getFreePort();
    const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-chrome-'));
    const child = spawn(chromePath, [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--hide-scrollbars',
        '--mute-audio',
        '--autoplay-policy=no-user-gesture-required',
        // Certificado próprio dos servidores de teste (somente loopback).
        '--ignore-certificate-errors',
        `--host-resolver-rules=${TEST_HOST_RULES}`,
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${profileDir}`,
        'about:blank'
    ], { stdio: ['ignore', 'ignore', 'pipe'] });

    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    const deadline = Date.now() + 12000;
    while (Date.now() < deadline) {
        try {
            const targets = await httpJson(`http://127.0.0.1:${port}/json/list`);
            const pageTarget = targets.find((target) => target.type === 'page');
            if (pageTarget) {
                const browserInfo = await httpJson(`http://127.0.0.1:${port}/json/version`);
                // /json/list expõe o identificador como "id"; o mesmo valor é o targetId
                // dos eventos Target.* do protocolo.
                const page = new Page(pageTarget.webSocketDebuggerUrl, child, profileDir, browserInfo.webSocketDebuggerUrl, pageTarget.id);
                await page.connect();
                return page;
            }
        } catch (_) {
            // Chrome ainda inicializando.
        }
        await delay(100);
    }

    child.kill('SIGKILL');
    throw new Error(`Chrome não iniciou.\n${stderr}`);
}

module.exports = { launchChrome, delay };
