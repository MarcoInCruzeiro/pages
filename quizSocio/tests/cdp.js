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
    constructor(wsUrl, process, profileDir) {
        this.wsUrl = wsUrl;
        this.process = process;
        this.profileDir = profileDir;
        this.ws = null;
        this.nextId = 1;
        this.pending = new Map();
        this.events = new Map();
    }

    async connect() {
        this.ws = new WebSocket(this.wsUrl);
        await new Promise((resolve, reject) => {
            this.ws.addEventListener('open', resolve, { once: true });
            this.ws.addEventListener('error', reject, { once: true });
        });
        this.ws.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            if (message.id && this.pending.has(message.id)) {
                const { resolve, reject } = this.pending.get(message.id);
                this.pending.delete(message.id);
                if (message.error) reject(new Error(JSON.stringify(message.error)));
                else resolve(message.result);
                return;
            }
            const listeners = this.events.get(message.method) || [];
            listeners.forEach((listener) => listener(message.params));
        });
        await this.send('Page.enable');
        await this.send('Runtime.enable');
        // Analytics reais nunca recebem tráfego de teste: os eventos são
        // capturados localmente por um gtag substituto.
        this.analyticsResponses = [];
        this.on('Network.responseReceived', ({ response }) => {
            if (ANALYTICS_HOSTS.some((host) => response.url.includes(host))) {
                this.analyticsResponses.push(response.url);
            }
        });
        await this.send('Network.enable');
        await this.send('Network.setBlockedURLs', {
            urls: ANALYTICS_HOSTS.map((host) => `*${host}*`)
        });
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
        await this.send('Page.navigate', { url });
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
                const page = new Page(pageTarget.webSocketDebuggerUrl, child, profileDir);
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
