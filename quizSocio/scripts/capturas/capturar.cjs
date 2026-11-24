/*
 * Exportação de capturas do Recomendador 5 Estrelas (briefing de 24/11/2026).
 * Uso (na pasta quizSocio, depois de npm run build):
 *   node scripts/capturas/capturar.cjs . /tmp/rodada
 *   python3 -I scripts/capturas/montar.py /tmp/rodada . AAAA-MM-DD
 * Depois copie /tmp/rodada para entregas/conteudo-recomendacoes-AAAA-MM-DD/.
 * Usa o Chrome via CDP dos testes do projeto, a pasta dist/ já construída e
 * respostas dadas pela interface real (cliques), sem enviar nada ao GA4.
 */
const fs = require('node:fs');
const path = require('node:path');

const PROJECT = path.resolve(process.argv[2]);
const OUT = path.resolve(process.argv[3]);
const { launchChrome, delay } = require('./cdp-export.cjs');
const { startServer } = require(path.join(PROJECT, 'tests/static-server.js'));
const questoes = require(path.join(PROJECT, 'config/questoes/questoes.json'));
const QUESTIONS = Array.isArray(questoes) ? questoes : (questoes.questions || questoes.questoes);
const PERFIS = require('./perfis.cjs');

const DESKTOP = { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false };
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 3, mobile: true };
const MARGIN = 24;

let page; let server;
const capturas = [];
const textosPorPerfil = {};
const errosDeExecucao = [];

const js = (fn, ...args) => page.evaluate(`(${fn.toString()})(${args.map((a) => JSON.stringify(a)).join(', ')})`);

async function setViewport(v) {
    await page.send('Emulation.setDeviceMetricsOverride', v);
    await page.send('Emulation.setTouchEmulationEnabled', { enabled: v.mobile });
}

async function open() {
    await page.navigate(`${server.baseUrl}/index.html`);
    await page.waitFor('Boolean(window.QuizEngine && document.querySelector("#startButton"))', 15000);
    await page.waitFor('document.getElementById("app")?.children.length > 0', 15000);
}

async function waitStep(n) {
    await page.waitFor(`document.querySelector('#stepCounter')?.textContent.trim() === 'Pergunta ${n} de ${QUESTIONS.length}'`
        + ` && (document.querySelectorAll('#options > *').length > 0 || document.querySelector('#rangeInput'))`, 10000);
}

async function answer(question, value) {
    if (question.type === 'range') {
        if (value === null || value === 'unknown') {
            await js(() => document.querySelector('#unknownToggle').click());
        } else {
            await js((v) => {
                const input = document.querySelector('#rangeInput');
                input.value = String(v);
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }, value);
        }
        return;
    }
    const index = question.options.findIndex((o) => o.value === value);
    if (index < 0) throw new Error(`Valor ${JSON.stringify(value)} sem opção em ${question.key}`);
    await js((i) => document.querySelector(`.option[data-option-index="${i}"]`).click(), index);
}

async function runProfile(perfil) {
    await open();
    await js(() => document.querySelector('#startButton').click());
    await waitStep(1);
    for (let i = 0; i < QUESTIONS.length; i += 1) {
        await answer(QUESTIONS[i], perfil.answers[QUESTIONS[i].key]);
        await js(() => document.querySelector('#nextButton').click());
        if (i < QUESTIONS.length - 1) await waitStep(i + 2);
    }
    const conflito = await page.waitFor('Boolean(document.querySelector(".conflict-panel") || document.querySelector("#resultSummary")?.textContent.trim())', 12000)
        .then(() => js(() => Boolean(document.querySelector('.conflict-panel'))));
    if (conflito) throw new Error(`Perfil ${perfil.id} disparou conflito`);
    await settle();
}

/* Fontes carregadas, transições terminadas, foco fora da página, nada aberto. */
async function settle() {
    await page.evaluate('document.fonts.ready.then(() => true)', true);
    await page.waitFor('document.getAnimations().every((a) => a.playState !== "running")', 8000).catch(() => {});
    await delay(150);
    await js(() => {
        document.activeElement?.blur();
        const details = document.querySelector('#scoreExplainer');
        if (details) details.open = false;
        document.querySelectorAll('[popover]').forEach((p) => { try { p.hidePopover(); } catch (_) { /* fechado */ } });
    });
    await delay(100);
}

async function rect(selector) {
    return js((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight };
    }, selector);
}

async function state() {
    return js(() => ({
        foco: document.activeElement === document.body || document.activeElement === null ? null : (document.activeElement.id || document.activeElement.className || document.activeElement.tagName),
        tooltipsAbertos: [...document.querySelectorAll('[popover]')].filter((p) => p.matches(':popover-open')).length,
        sobreAberto: Boolean(document.querySelector('#scoreExplainer')?.open),
        animacoes: document.getAnimations().filter((a) => a.playState === 'running').length,
        textoVisivel: document.body.innerText
    }));
}

async function shoot(file, clip, viewport, perfil, extra = {}) {
    const s = await state();
    const target = path.join(OUT, 'imagens', file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const { data } = await page.send('Page.captureScreenshot', {
        format: 'png', captureBeyondViewport: false, fromSurface: true,
        clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: 1 }
    });
    fs.writeFileSync(target, Buffer.from(data, 'base64'));
    const result = await page.evaluate(`JSON.parse(JSON.stringify(window.QuizEngine.recommendPlans(${JSON.stringify(perfil.answers)})))`);
    capturas.push({
        arquivo: `imagens/${file}`,
        captura: extra.captura,
        perfil: perfil.id,
        respostas: perfil.answers,
        planoRecomendado: result.eligible[0]?.plan.slug ?? null,
        notas: Object.fromEntries(result.all.map((r) => [r.plan.slug, { indice: r.score, noOrcamento: r.eligibility.withinBudget }])),
        viewport: { largura: viewport.width, altura: viewport.height, densidade: viewport.deviceScaleFactor, celular: viewport.mobile },
        recorte: { x: Math.round(clip.x), y: Math.round(clip.y), largura: Math.round(clip.width), altura: Math.round(clip.height), unidade: 'px CSS' },
        elementos: extra.elementos || undefined,
        estadoNaCaptura: { foco: s.foco, tooltipsAbertos: s.tooltipsAbertos, sobreAberto: s.sobreAberto, animacoesEmCurso: s.animacoes },
        textoProibido: ['conteúdo exclusivo', 'quiz e votações', 'ficou perto', 'Também recomendado'].filter((t) => extra.textoDoRecorte?.toLowerCase().includes(t.toLowerCase()))
    });
}

/* Altura do cabeçalho fixo ou grudado no topo (fora do modal). */
async function headerHeight() {
    return js(() => Math.max(0, ...[...document.querySelectorAll('body *')].filter((el) => {
        if (el.closest('#comparisonModal')) return false;
        const pos = getComputedStyle(el).position;
        if (pos !== 'fixed' && pos !== 'sticky') return false;
        const r = el.getBoundingClientRect();
        return r.top <= 1 && r.height > 0 && r.height < 240 && r.width > window.innerWidth / 2;
    }).map((el) => el.getBoundingClientRect().bottom)));
}

/* Rola até o elemento e, se ele não couber, aumenta só a altura da janela. */
async function frame(selector, viewport, { fixed = false, fromTop = false } = {}) {
    let used = viewport;
    for (let attempt = 0; attempt < 3; attempt += 1) {
        if (!fixed) {
            const top = await js((sel) => document.querySelector(sel).getBoundingClientRect().top + window.scrollY, selector);
            const header = fromTop ? 0 : await headerHeight();
            await js((y) => window.scrollTo(0, y), fromTop ? 0 : Math.max(0, top - MARGIN - header));
        }
        await settle();
        const r = await rect(selector);
        const scrollY = await js(() => window.scrollY);
        const need = fromTop ? Math.ceil(r.y + r.height + MARGIN) : Math.ceil(r.y - scrollY + r.height + MARGIN);
        if (!fromTop && !fixed && r.y - scrollY - MARGIN < (await headerHeight()) - 1 && scrollY > 0) throw new Error(`Cabeçalho cobre ${selector}`);
        if (need <= used.height) {
            const clip = fromTop ? { x: 0, y: 0, width: used.width, height: need } : withMargin(r, used);
            return { r, clip, used };
        }
        used = { ...used, height: need };
        await setViewport(used);
    }
    throw new Error(`Não coube: ${selector}`);
}

function withMargin(r, viewport) {
    const x = Math.max(0, r.x - MARGIN);
    const y = Math.max(0, r.y - MARGIN);
    return { x, y, width: Math.min(viewport.width - x, r.width + 2 * MARGIN), height: r.height + 2 * MARGIN };
}

async function elementText(selector) {
    return js((sel) => document.querySelector(sel)?.innerText || '', selector);
}

/* Posições dos elementos da anatomia, relativas ao recorte (px CSS e px da imagem). */
async function anatomy(clip, dsf) {
    const alvo = { selo: '.result-card .result-badge', preco: '#resultPrice', adesao: '#resultAdhesion', resumo: '#resultSummary',
        motivos: '#resultReasons', sobre: '#scoreExplainer', botoes: '.result-card .result-actions' };
    const out = {};
    for (const [nome, sel] of Object.entries(alvo)) {
        const r = await rect(sel);
        if (!r) continue;
        const css = { x: Math.round(r.x - clip.x), y: Math.round(r.y - clip.y), largura: Math.round(r.width), altura: Math.round(r.height) };
        out[nome] = { css, imagem: { x: css.x * dsf, y: css.y * dsf, largura: css.largura * dsf, altura: css.altura * dsf } };
    }
    return out;
}

async function captureResultCard(file, perfil, viewport, captura, comAnatomia) {
    const { clip, used } = await frame('.result-card', viewport);
    const elementos = comAnatomia ? await anatomy(clip, viewport.deviceScaleFactor) : undefined;
    await shoot(file, clip, used, perfil, { captura, elementos, textoDoRecorte: await elementText('.result-card') });
    if (used !== viewport) await setViewport(viewport);
}

async function capturePlanCard(file, perfil, slug, viewport, captura) {
    const sel = `#plan-${slug}`;
    const { clip, used } = await frame(sel, viewport);
    const index = await js((s) => [...document.querySelectorAll('#plansList .plan')].indexOf(document.querySelector(s)), sel);
    await shoot(file, clip, used, perfil, { captura: `${captura} (posição ${index + 1} na lista)`, textoDoRecorte: await elementText(sel) });
    if (used !== viewport) await setViewport(viewport);
}

async function openComparison() {
    await js(() => document.querySelector('#compareButton').click());
    await page.waitFor('document.querySelector("#comparisonModal")?.classList.contains("is-open")', 5000);
    await settle();
    await js(() => { const b = document.querySelector('#modalComparisonBody'); if (b) { b.scrollLeft = 0; b.scrollTop = 0; } document.querySelector('.comparison-wrapper')?.scrollTo?.(0, 0); });
    await delay(100);
}

async function captureComparisonDesktop(file, perfil, viewport, captura) {
    await js(() => window.scrollTo(0, 0));
    await openComparison();
    const { clip, used } = await frame('.modal-content', viewport, { fixed: true });
    await shoot(file, clip, used, perfil, { captura, textoDoRecorte: await elementText('.modal-content') });
    const tabela = await scrapeComparison();
    await js(() => document.querySelector('#modalClose').click());
    await page.waitFor('!document.querySelector("#comparisonModal")?.classList.contains("is-open")', 5000);
    if (used !== viewport) await setViewport(viewport);
    return tabela;
}

async function scrapeComparison() {
    return js(() => {
        const table = document.querySelector('.comparison-table');
        const planos = [...table.querySelectorAll('thead th')].slice(1).map((th) => ({
            nome: (th.querySelector('.plan-name')?.textContent || '').trim(),
            selo: (th.querySelector('.plan-badge')?.textContent || '').trim(),
            destacado: th.className.includes('highlight')
        }));
        const linhas = [...table.querySelectorAll('tbody tr')].map((tr) => ({
            rotulo: tr.children[0].innerText.trim(),
            celulas: [...tr.children].slice(1).map((td) => {
                const tip = td.querySelector('.benefit-tooltip-content');
                // innerText da célula viva: mantém as quebras e ignora o tooltip fechado; o "i" do ícone sai.
                const linhas = td.innerText.split('\n').map((x) => x.trim()).filter((x) => x && x !== 'i');
                const tooltip = tip ? ([...tip.children].length ? [...tip.children].map((n) => n.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n\n') : tip.textContent.trim()) : undefined;
                return { texto: linhas.join(' · '), tooltip };
            })
        }));
        const ctas = [...document.querySelectorAll('#modalComparisonBody a.plan-cta')].map((a) => ({ plano: a.dataset.plan, texto: a.textContent.trim(), link: a.href || null, desativado: a.getAttribute('aria-disabled') === 'true' }));
        return {
            titulo: document.querySelector('.modal-title')?.innerText.trim(),
            orientacao: document.querySelector('.modal-hint')?.innerText.trim(),
            planos, linhas, ctas
        };
    });
}

async function scrapeResult() {
    return js(() => {
        const norm = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
        const t = (s) => norm(document.querySelector(s));
        return {
            selo: t('.result-card .result-badge'),
            plano: document.querySelector('#resultLogo')?.alt.replace('Logo do plano ', '') || '',
            preco: t('#resultPrice'), referencia: t('#resultContract'), adesao: t('#resultAdhesion'),
            resumo: t('#resultSummary'), avisoSetor: t('#sectorNotice'),
            motivos: [...document.querySelectorAll('#resultReasons li')].map(norm),
            sobre: [...document.querySelectorAll('#scoreExplainer > div p')].map((p) => p.textContent.trim()),
            acoes: [...document.querySelectorAll('.result-actions .btn')].map(norm),
            tituloLista: t('.plans-title h2'), subtituloLista: t('.plans-title span'),
            cards: [...document.querySelectorAll('#plansList .plan')].map((card) => ({
                slug: card.id.replace('plan-', ''),
                selo: norm(card.querySelector('.result-badge')),
                preco: norm(card.querySelector('.result-price')),
                referencia: norm(card.querySelector('.result-plan small')),
                adesao: norm(card.querySelector('.plan-fee')),
                beneficios: [...card.querySelectorAll('.benefits-list li')].map(norm),
                avisoSetor: norm(card.querySelector('.plan-sector-note')),
                nota: norm(card.querySelector('.plan-score')),
                cta: norm(card.querySelector('.plan-cta')),
                link: card.querySelector('.plan-cta')?.href || null
            }))
        };
    });
}

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    server = await startServer(path.join(PROJECT, 'dist'));
    page = await launchChrome({ chromePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
    page.on('Runtime.exceptionThrown', ({ exceptionDetails }) => errosDeExecucao.push(exceptionDetails?.exception?.description || exceptionDetails?.text));
    await page.send('Runtime.enable');
    // Segurança extra: nenhuma requisição a domínios do Google sai da página.
    await page.send('Network.setBlockedURLs', { urls: ['*google-analytics.com*', '*googletagmanager.com*', '*analytics.google.com*', '*doubleclick.net*'] });
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

    const byId = Object.fromEntries(PERFIS.map((p) => [p.id, p]));
    let tabela = null;

    // Desktop
    await setViewport(DESKTOP);
    for (const perfil of PERFIS) {
        await runProfile(perfil);
        textosPorPerfil[perfil.id] = await scrapeResult();
        if (perfil.id === '1') {
            await captureResultCard('resultados/cabuloso.png', perfil, DESKTOP, 'A', true);
            await capturePlanCard('cards/cabuloso.png', perfil, 'cabuloso', DESKTOP, 'B');
            await capturePlanCard('cards/outra-opcao.png', perfil, textosPorPerfil['1'].cards[1].slug, DESKTOP, 'F');
            tabela = await captureComparisonDesktop('comparacao/tabela-completa.png', perfil, DESKTOP, 'C');
        }
        if (perfil.id === '2') await capturePlanCard('cards/cabuloso-nivel-3.png', perfil, 'cabuloso', DESKTOP, 'D');
        if (perfil.id === '3') await capturePlanCard('cards/time-do-povo.png', perfil, 'time-do-povo', DESKTOP, 'E');
        if (perfil.id === '4a') await captureResultCard('resultados/sem-estadio-apoio.png', perfil, DESKTOP, 'G (apoio)', false);
        if (perfil.id === '4b') await captureResultCard('resultados/sem-estadio-loja.png', perfil, DESKTOP, 'G (loja)', false);
    }

    // Celular (perfil 1)
    await setViewport(MOBILE);
    const p1 = byId['1'];
    await runProfile(p1);
    const mob = await frame('.result-card', MOBILE, { fromTop: true });
    await shoot('mobile/resultado-390.png', mob.clip, mob.used, p1, { captura: 'H (resultado)', textoDoRecorte: await elementText('.result-card') });
    await setViewport(MOBILE);
    await js(() => window.scrollTo(0, 0));
    await settle();
    await openComparison();
    const scrollY = await js(() => window.scrollY);
    await shoot('mobile/comparativo-390.png', { x: 0, y: scrollY, width: MOBILE.width, height: MOBILE.height }, MOBILE, p1,
        { captura: 'H (comparativo)', textoDoRecorte: await elementText('.modal-content') });

    // Textos completos dos tooltips do comparativo (mesma rodada).
    const tooltips = tabela.linhas.flatMap((linha) => linha.celulas.map((c, i) => c.tooltip ? { plano: tabela.planos[i].nome, linha: linha.rotulo, texto: c.tooltip } : null)).filter(Boolean);

    // Catálogo dos cards pelo motor da própria página, com as respostas do perfil 1.
    const catalogo = await page.evaluate(`(() => {
        const m = window.QuizEngine; const a = ${JSON.stringify(p1.answers)};
        return m.plans.map((plan) => { const c = m.getPlanContract(plan); return {
            slug: plan.slug, nome: plan.nome, preco: c.priceText, referencia: c.totalText,
            adesao: m.getPlanPricing(plan).adhesion ? 'Taxa única de adesão de ' + m.formatBRL(m.getPlanPricing(plan).adhesion) + ', à parte' : 'Sem taxa de adesão',
            beneficios: m.getPlanBenefits(plan, a), cta: m.getCTAText(plan, a), link: plan.contratacao.link }; });
    })()`);
    const revision = JSON.parse(fs.readFileSync(path.join(PROJECT, 'config/revision.json'), 'utf8'));

    const saida = {
        catalogo, tabela, tooltips, textosPorPerfil, capturas, revision,
        verificacao: { errosDeExecucao, enviosDeAnalytics: page.analyticsAttempts || [], navegacoesParaCheckout: page.checkoutAttempts || [] }
    };
    fs.writeFileSync(path.join(OUT, '_rodada.json'), JSON.stringify(saida, null, 2));
    await page.close();
    await server.close();
    console.log(`capturas: ${capturas.length}; erros: ${errosDeExecucao.length}; analytics: ${(page.analyticsAttempts || []).length}`);
}

main().catch(async (error) => {
    console.error(error);
    try { await page?.close(); } catch (_) { /* noop */ }
    try { await server?.close(); } catch (_) { /* noop */ }
    process.exit(1);
});
