/*
 * Testes de navegador do Quiz Sócio 5 Estrelas.
 *
 * Usam o Chrome instalado via CDP, sem Playwright. Cada teste recarrega a
 * página, instala captura local de analytics e interage com o DOM real.
 * Nenhum evento é enviado ao GA4 e nenhum checkout é concluído.
 */
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { describe, it, before, after, beforeEach, afterEach } = require('node:test');

const engine = require('../quiz-engine.js');
const { launchChrome } = require('./cdp.js');
const { startServer } = require('./static-server.js');

const ROOT = path.resolve(__dirname, '..');
const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';

function contrastRatio(foreground, background) {
    const parse = (value) => value.match(/[\d.]+/g).map(Number);
    const blend = (rgba, base) => rgba.slice(0, 3).map((value, index) => value * (rgba[3] ?? 1) + base[index] * (1 - (rgba[3] ?? 1)));
    const bg = blend(parse(background), [255, 255, 255]);
    const fg = blend(parse(foreground), bg);
    const luminance = (rgb) => rgb.map((value) => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const a = luminance(fg), b = luminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const NORMAL_ANSWERS = [
    { type: 'range', value: 15 },
    { type: 'unknown' },
    { type: 'option', index: 1 },
    { type: 'option', index: 1 },
    { type: 'option', index: 0 },
    { type: 'option', index: 0 },
    { type: 'option', index: 0 },
    { type: 'option', index: 0 },
    { type: 'option', index: 0 },
    { type: 'option', index: 0 },
    { type: 'option', index: 2 },
    { type: 'option', index: 1 }
];

const CONFLICT_ANSWERS = [
    { type: 'range', value: 0 },
    { type: 'range', value: 0 },
    { type: 'option', index: 1 },
    { type: 'option', index: 1 },
    { type: 'option', index: 0 },
    { type: 'option', index: 0 },
    { type: 'option', index: 0 },
    { type: 'option', index: 0 },
    { type: 'option', index: 0 },
    { type: 'option', index: 0 },
    { type: 'option', index: 2 },
    { type: 'option', index: 1 }
];

const BUDGET_PURPLE_ANSWERS = [
    { type: 'range', value: 10 },
    { type: 'unknown' },
    { type: 'option', index: 2 },
    { type: 'option', index: 1 },
    { type: 'option', index: 0 },
    { type: 'option', index: 1 },
    { type: 'option', index: 1 },
    { type: 'option', index: 1 },
    { type: 'option', index: 1 },
    { type: 'option', index: 1 },
    { type: 'option', index: 0 },
    { type: 'option', index: 2 }
];

let server;
let page;

function evaluate(fn, ...args) {
    const serializedArgs = args.map((value) => JSON.stringify(value)).join(', ');
    return page.evaluate(`(${fn.toString()})(${serializedArgs})`);
}

async function installHooks() {
    await page.evaluate(`(() => {
        window.__events = [];
        window.__opened = [];
        window.gtag = function (kind, name, params) {
            if (kind !== 'event') return;
            window.__events.push({ name, params: JSON.parse(JSON.stringify(params || {})) });
        };
        window.open = function (url) {
            window.__opened.push(String(url));
            return null;
        };
    })()`);
}

async function openPage(url = '') {
    // Aceita caminho/query relativo ao servidor local ou URL completa (hosts de
    // loopback alternativos e do ambiente habilitado nos testes de isolamento).
    await page.navigate(url.startsWith('http') ? url : `${server.baseUrl}/index.html${url}`);
    await installHooks();
}

async function setup(url = '') {
    await openPage(url);
    // Habilitação artificial para os testes de contrato: os testes de
    // isolamento usam openPage e observam a decisão original da página
    // (QUIZ-013). Aqui o gtag é mockado e nada vai para produção.
    await page.evaluate('window.coletaHabilitada = true');
}

async function click(selector) {
    await evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) throw new Error(`Elemento não encontrado: ${sel}`);
        element.click();
    }, selector);
}

async function text(selector) {
    return evaluate((sel) => document.querySelector(sel)?.textContent.trim() || '', selector);
}

async function waitStep(step) {
    await page.waitFor(
        `document.querySelector('#stepCounter')?.textContent.trim() === 'Pergunta ${step} de 12'`
        + ` && document.querySelector('#quizTitle')?.textContent.trim().length > 0`
        + ` && document.querySelectorAll('#options > *').length > 0`,
        10000
    );
}

async function waitQuestionTitle(expectedPrefix) {
    await page.waitFor(
        `document.querySelector('#quizTitle')?.textContent.trim().startsWith(${JSON.stringify(expectedPrefix)})`,
        10000
    );
}

async function waitResults() {
    await page.waitFor(
        `document.querySelectorAll('.results').length === 1 && document.querySelector('#resultSummary')?.textContent.trim().length > 0`,
        12000
    );
}

async function waitConflictGate() {
    await page.waitFor(`Boolean(document.querySelector('.conflict-panel'))`, 10000);
}

async function startQuiz() {
    await click('#startButton');
    await waitStep(1);
}

async function applyAnswer(answer) {
    if (answer.type === 'range') {
        await evaluate((value) => {
            const input = document.querySelector('#rangeInput');
            input.value = String(value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }, answer.value);
        return;
    }
    if (answer.type === 'unknown') {
        await click('#unknownToggle');
        return;
    }
    await click(`.option[data-option-index="${answer.index}"]`);
}

async function runQuiz(answers) {
    for (let index = 0; index < answers.length; index += 1) {
        await applyAnswer(answers[index]);
        await click('#nextButton');
        if (index < answers.length - 1) await waitStep(index + 2);
    }
}

async function getEvents(name = null) {
    const events = await page.evaluate('window.__events || []');
    return name ? events.filter((event) => event.name === name) : events;
}

function dispatchKey(key, code, keyCode) {
    return page.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode })
        .then(() => page.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode }));
}

function dispatchEnter() {
    return page.send('Input.dispatchKeyEvent', {
        type: 'keyDown',
        key: 'Enter',
        code: 'Enter',
        text: '\r',
        unmodifiedText: '\r',
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13
    }).then(() => page.send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key: 'Enter',
        code: 'Enter',
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13
    }));
}

/*
 * Espera condições avaliadas no lado Node (tentativas interceptadas pelo CDP
 * chegam fora do ciclo de avaliação da página).
 */
function waitUntil(predicate, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const started = Date.now();
        const tick = () => {
            if (predicate()) { resolve(); return; }
            if (Date.now() - started > timeout) {
                reject(new Error('Condição não satisfeita dentro do prazo'));
                return;
            }
            setTimeout(tick, 50);
        };
        tick();
    });
}

describe('Quiz Sócio — fluxo de navegador', { concurrency: 1 }, () => {
    before(async () => {
        server = await startServer(ROOT);
        page = await launchChrome({ chromePath: CHROME_PATH });
        page.exceptions = [];
        page.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
            page.exceptions.push(exceptionDetails.exception?.description || exceptionDetails.text || 'exceção');
        });
    });

    after(async () => {
        await page?.close();
        await server?.close();
    });

    beforeEach(() => {
        page.exceptions = [];
        page.checkoutAttempts = [];
    });

    afterEach(async () => {
        assert.deepEqual(page.exceptions, [], 'A página não deve lançar exceções');
        assert.deepEqual(page.analyticsResponses, [], 'Nenhuma requisição de analytics pode sair do navegador de teste');
        await page.closeChildTabs();
    });

    it('clique duplo em Continuar avança exatamente uma pergunta', async () => {
        await setup();
        await startQuiz();
        await applyAnswer({ type: 'range', value: 15 });

        await evaluate(() => {
            const button = document.querySelector('#nextButton');
            button.click();
            button.click();
        });

        await waitStep(2);
        assert.equal(await text('#stepCounter'), 'Pergunta 2 de 12');        assert.match(await text('#quizTitle'), /últimos 15 meses/);

        const answers = await getEvents('quiz_answer');
        assert.equal(answers.length, 1);
        assert.equal(answers[0].params.quiz_question, 'gamesPerYear');
        assert.equal(answers[0].params.quiz_step, 1);
    });

    it('alternar rapidamente Voltar e Continuar mantém a pergunta correta', async () => {
        await setup();
        await startQuiz();
        await applyAnswer({ type: 'range', value: 15 });
        await click('#nextButton');
        await waitStep(2);
        const historyHint = await text('.range-value');
        assert.match(historyHint, /Não lembra ou ainda não é sócio/);
        assert.doesNotMatch(historyHint, /define o nível|histórico confirmado|condição inicial/i);
        await applyAnswer({ type: 'unknown' });
        await click('#nextButton');
        await waitStep(3);

        await evaluate(() => {
            document.querySelector('#backButton').click();
            document.querySelector('#nextButton').click();
        });

        await waitStep(2);
        assert.match(await text('#quizTitle'), /últimos 15 meses/);
        assert.equal(await evaluate(() => document.querySelector('#unknownToggle').checked), true);
    });

    it('Voltar preserva as respostas e a seleção visual', async () => {
        await setup();
        await startQuiz();
        await applyAnswer({ type: 'range', value: 15 });
        await click('#nextButton');
        await waitStep(2);
        await applyAnswer({ type: 'unknown' });
        await click('#nextButton');
        await waitStep(3);
        await applyAnswer({ type: 'option', index: 1 });

        await click('#backButton');
        await waitStep(2);
        assert.equal(await evaluate(() => document.querySelector('#unknownToggle').checked), true);

        await click('#backButton');
        await waitStep(1);
        assert.equal(await evaluate(() => document.querySelector('#rangeInput').value), '15');
        assert.match(await text('#rangeOutput'), /15.*jogos/i);

        await click('#nextButton');
        await waitStep(2);
        assert.equal(await evaluate(() => document.querySelector('#unknownToggle').checked), true);

        await click('#nextButton');
        await waitStep(3);
        assert.equal(await evaluate(() => document.querySelector('.option[data-option-index="1"]').classList.contains('selected')), true);
    });

    it('resposta ausente não avança e mostra orientação', async () => {
        await setup();
        await startQuiz();
        await applyAnswer({ type: 'range', value: 15 });
        await click('#nextButton');
        await waitStep(2);
        await applyAnswer({ type: 'unknown' });
        await click('#nextButton');
        await waitStep(3);

        assert.equal(await evaluate(() => document.querySelector('#nextButton').disabled), true);
        const before = (await getEvents('quiz_answer')).length;

        await evaluate(() => {
            const button = document.querySelector('#nextButton');
            button.disabled = false;
            button.click();
        });

        await waitStep(3);
        assert.equal(await text('#fieldError'), 'Selecione uma das opções para continuar.');
        assert.equal(await evaluate(() => document.querySelector('#fieldError').hidden), false);
        const errorColors = await evaluate(() => {
            const style = getComputedStyle(document.querySelector('#fieldError'));
            return [style.color, style.backgroundColor];
        });
        assert.ok(contrastRatio(...errorColors) >= 4.5, 'mensagem de erro precisa ser legível no fundo claro');
        assert.equal((await getEvents('quiz_answer')).length, before);

        await applyAnswer({ type: 'option', index: 1 });
        await click('#nextButton');
        await waitStep(4);
        const after = await getEvents('quiz_answer');
        assert.equal(after.length, before + 1);
        assert.equal(after.at(-1).params.quiz_question, 'wantsGuaranteedTicket');
    });

    it('zero jogos e opções false são respostas válidas', async () => {
        await setup();
        await startQuiz();
        await applyAnswer({ type: 'range', value: 0 });
        await click('#nextButton');
        await waitStep(2);
        await applyAnswer({ type: 'unknown' });
        await click('#nextButton');
        await waitStep(3);
        await applyAnswer({ type: 'option', index: 2 });
        await click('#nextButton');
        await waitStep(4);

        const answers = await getEvents('quiz_answer');
        assert.equal(answers[0].params.quiz_answer, '0');
        const falseAnswer = answers.find((event) => event.params.quiz_question === 'wantsGuaranteedTicket');
        assert.equal(falseAnswer.params.quiz_answer, 'false');
        assert.match(falseAnswer.params.quiz_answer_label, /jogos mais decisivos/i);
    });

    it('conflito pede confirmação e produz um único resultado', async () => {
        await setup();
        await startQuiz();
        await runQuiz(CONFLICT_ANSWERS);
        await waitConflictGate();

        assert.equal(await evaluate(() => document.querySelectorAll('.results').length), 0);
        assert.match(await text('#quizTitle'), /confira suas respostas/i);
        assert.equal(await evaluate(() => document.querySelectorAll('.conflict-panel li').length), 2);
        const presentation = await evaluate(() => {
            const panel = document.querySelector('.conflict-panel');
            const back = document.querySelector('#backButton').getBoundingClientRect();
            const next = document.querySelector('#nextButton').getBoundingClientRect();
            return {
                text: getComputedStyle(panel).color,
                background: getComputedStyle(panel).backgroundColor,
                listText: getComputedStyle(panel.querySelector('li')).color,
                backY: back.y, nextY: next.y, backHeight: back.height, nextHeight: next.height,
                focus: document.activeElement.id
            };
        });
        assert.ok(contrastRatio(presentation.text, presentation.background) >= 4.5);
        assert.ok(contrastRatio(presentation.listText, presentation.background) >= 4.5);
        assert.ok(Math.abs(presentation.backHeight - presentation.nextHeight) <= 1, 'ações devem ter a mesma altura');
        assert.ok(Math.abs(presentation.backY - presentation.nextY) <= 1, 'ações devem ficar alinhadas');
        assert.equal(presentation.focus, 'quizTitle');
        assert.doesNotMatch(await text('.conflict-panel'), /necessidade presencial|intenção anual define|prevalece/i);

        await evaluate(() => {
            const button = document.querySelector('#nextButton');
            button.click();
            button.click();
        });
        await waitResults();

        assert.equal(await evaluate(() => document.querySelectorAll('.results').length), 1);
        assert.equal(await evaluate(() => document.querySelectorAll('.result-card').length), 1);
        assert.equal((await getEvents('quiz_complete')).length, 1);
    });

    it('revisar respostas a partir do conflito volta à primeira pergunta', async () => {
        await setup();
        await startQuiz();
        await runQuiz(CONFLICT_ANSWERS);
        await waitConflictGate();

        await click('#backButton');
        await waitStep(1);
        await waitQuestionTitle('Em média, a quantos jogos');
        assert.equal(await evaluate(() => document.querySelectorAll('.results').length), 0);
    });

    it('confirmação no celular mantém leitura e ações acessíveis sem espaço extra', async () => {
        await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
        try {
            await setup();
            await startQuiz();
            await runQuiz(CONFLICT_ANSWERS);
            await waitConflictGate();
            const layout = await evaluate(() => {
                const back = document.querySelector('#backButton').getBoundingClientRect();
                const next = document.querySelector('#nextButton').getBoundingClientRect();
                return {
                    backHeight: back.height, nextHeight: next.height,
                    sameWidth: Math.abs(back.width - next.width) <= 1,
                    gap: next.top - back.bottom,
                    overflow: document.documentElement.scrollWidth > innerWidth
                };
            });
            assert.ok(layout.backHeight >= 44 && layout.nextHeight >= 44);
            assert.ok(Math.abs(layout.backHeight - layout.nextHeight) <= 1);
            assert.ok(layout.sameWidth);
            assert.ok(layout.gap >= 8 && layout.gap <= 20, 'espaçamento entre ações deve ser consistente');
            assert.equal(layout.overflow, false);
        } finally {
            await page.send('Emulation.clearDeviceMetricsOverride');
        }
    });

    it('menu móvel pode ser aberto por teclado e informa seu estado', async () => {
        await page.send('Emulation.setDeviceMetricsOverride', { width: 768, height: 900, deviceScaleFactor: 1, mobile: true });
        try {
            await setup();
            assert.equal(await evaluate(() => document.querySelector('.nav-toggle').tagName), 'BUTTON');
            await evaluate(() => document.querySelector('.nav-toggle').focus());
            await dispatchEnter();
            assert.equal(await evaluate(() => document.querySelector('.nav-toggle').getAttribute('aria-expanded')), 'true');
            assert.equal(await evaluate(() => document.querySelector('#headerMenu').classList.contains('open')), true);
            await dispatchKey('Escape', 'Escape', 27);
            assert.equal(await evaluate(() => document.querySelector('.nav-toggle').getAttribute('aria-expanded')), 'false');
        } finally {
            await page.send('Emulation.clearDeviceMetricsOverride');
        }
    });

    it('resultado único mantém o contrato de analytics e o CTA', async () => {
        await setup();
        await startQuiz();
        await runQuiz(NORMAL_ANSWERS);
        await evaluate(() => {
            const button = document.querySelector('#nextButton');
            button.click();
            button.click();
        });
        await waitResults();

        assert.equal(await evaluate(() => document.querySelectorAll('.results').length), 1);
        assert.equal(await evaluate(() => document.querySelectorAll('.result-card').length), 1);

        const starts = await getEvents('quiz_start');
        const answers = await getEvents('quiz_answer');
        const completes = await getEvents('quiz_complete');
        assert.equal(starts.length, 1);
        assert.equal(answers.length, 12);
        assert.equal(completes.length, 1);

        const questionKeys = engine.questions.map((question) => question.key);
        answers.forEach((event, index) => {
            assert.equal(event.params.quiz_step, index + 1);
            assert.equal(event.params.quiz_question, questionKeys[index]);
            assert.equal(typeof event.params.quiz_answer, 'string');
            assert.equal(typeof event.params.quiz_answer_label, 'string');
            assert.equal(typeof event.params.answer_time_sec, 'number');
        });

        const complete = completes[0].params;
        assert.equal(typeof complete.recommended_plan, 'string');
        assert.equal(typeof complete.affinity_index, 'number');
        assert.equal(complete.score_semantics, 'indice_afinidade_estimado');
        assert.equal(complete.catalog_version, engine.CATALOG_VERSION);
        assert.equal(typeof complete.total_time_sec, 'number');
        assert.equal(complete.answer_gamesPerYear, '15');
        assert.equal(complete.answer_gamesHistory, 'unknown');
        assert.equal(complete.answer_wantsGuaranteedTicket, 'true');
        // QUIZ-014: rules_version comparada com o motor vigente, sem copiar o
        // valor literal da versão; a página e o módulo testado coincidem.
        assert.equal(complete.rules_version, await evaluate(() => window.QuizEngine.RULES_VERSION),
            'rules_version deve corresponder ao motor vigente embutido na página');
        assert.equal(complete.rules_version, engine.RULES_VERSION,
            'motor da página e módulo testado devem coincidir');
        // GA4 aceita até 25 parâmetros por evento; o contrato atual usa no
        // máximo 20 (campos principais + answer_*).
        assert.ok(Object.keys(complete).length <= 20, `contrato de quiz_complete excedeu 20 parâmetros: ${Object.keys(complete).length}`);

        assert.match(await text('#scoreExplainer'), /resultado é uma sugestão/i);
        assert.doesNotMatch(await text('#scoreExplainer'), /Catálogo \d{4}|índice de 0 a 100/i);
        assert.match(await text('#assumptionNote'), /R\$\s*150/);
        assert.match(await text('#assumptionNote'), /Kids depende de aprovação/);
        assert.match(await text('#assumptionNote'), /mediante disponibilidade e aquisição do ingresso do titular/);
        assert.match(await text('#resultSummary'), /de 100 de afinidade estimada/);
        assert.ok((await text('#resultSummary')).includes(Number(complete.affinity_index).toLocaleString('pt-BR', { maximumFractionDigits: 1 })));
        assert.equal(await evaluate(() => formatScore(89.4)), '89,4');
        assert.match(await text('#resultAdhesion'), /Taxa única de adesão|Sem taxa de adesão/);
        assert.equal(await evaluate(() => document.querySelectorAll('.plan-cost').length), 0);

        // QUIZ-015: o CTA principal é um link real com o destino do catálogo;
        // o clique navega pelo comportamento do link (aba nova, sem opener) e
        // a tentativa é interceptada antes da transmissão.
        const cta = await evaluate(() => {
            const link = document.querySelector('#subscribeButton');
            return {
                tag: link.tagName,
                href: link.href,
                target: link.getAttribute('target'),
                rel: link.getAttribute('rel'),
                plano: link.dataset.plan,
                texto: link.textContent.trim()
            };
        });
        assert.equal(cta.tag, 'A', 'CTA principal de contratação deve ser um link real');
        const esperado = engine.plans.find((plan) => plan.nome === cta.plano)?.contratacao.link;
        assert.ok(esperado, 'plano do CTA existe no catálogo');
        assert.equal(cta.href, esperado, 'href deve ser o link do catálogo do plano recomendado');
        assert.equal(cta.target, '_blank');
        assert.equal(cta.rel, 'noopener noreferrer');

        await click('#subscribeButton');
        await waitUntil(() => page.checkoutAttempts.length === 1);

        const subscribe = await getEvents('quiz_subscribe_click');
        assert.equal(subscribe.length, 1);
        assert.equal(subscribe[0].params.cta_location, 'resultado');
        assert.equal(subscribe[0].params.plan, cta.plano);
        assert.equal(subscribe[0].params.clicked_recommended, 'true');
        assert.equal(page.checkoutAttempts[0], cta.href, 'a navegação interceptada é o destino do link');
        assert.deepEqual(await page.evaluate('window.__opened || []'), [], 'CTA não pode usar window.open');
    });

    it('Refazer quiz limpa o estado e permite nova conclusão', async () => {
        await setup();
        await startQuiz();
        await runQuiz(NORMAL_ANSWERS);
        await evaluate(() => document.querySelector('#nextButton').click());
        await waitResults();

        await click('#restartButton');
        await page.waitFor('Boolean(document.querySelector("#startButton"))', 10000);
        await page.waitFor('document.querySelectorAll(".results").length === 0', 10000);
        assert.equal(await evaluate(() => document.querySelectorAll('.results').length), 0);

        await startQuiz();
        assert.match(await text('#rangeOutput'), /^0\s*jogos$/i);
        await runQuiz(NORMAL_ANSWERS);
        await evaluate(() => document.querySelector('#nextButton').click());
        await waitResults();

        assert.equal((await getEvents('quiz_start')).length, 2);
        assert.equal((await getEvents('quiz_answer')).length, 24);
        assert.equal((await getEvents('quiz_complete')).length, 2);

        // QUIZ-014: cada nova conclusão é válida e carrega a versão vigente do
        // motor, sem duplicidade por renderização ou clique repetido.
        const motor = await evaluate(() => window.QuizEngine.RULES_VERSION);
        const conclusoes = await getEvents('quiz_complete');
        conclusoes.forEach((evento, index) => {
            assert.equal(evento.params.rules_version, motor, `conclusão ${index + 1} deve usar o motor vigente`);
            assert.equal(typeof evento.params.recommended_plan, 'string', `conclusão ${index + 1} recomenda um plano`);
            assert.equal(typeof evento.params.affinity_index, 'number', `conclusão ${index + 1} tem afinidade numérica`);
        });
    });

    it('orçamento restrito e setor incompatível preservam preços e taxas separados', async () => {
        await setup();
        await startQuiz();
        await runQuiz(BUDGET_PURPLE_ANSWERS);
        await evaluate(() => document.querySelector('#nextButton').click());
        await waitResults();

        assert.match(await evaluate(() => document.querySelector('#resultLogo').alt), /Meu Cruzeiro/);
        assert.match(await text('#resultPrice'), /R\$\s*12,00.*mês/);
        assert.match(await text('#resultContract'), /Total anual/);
        assert.match(await text('#results'), /ingresso gratuito por temporada/i);
        assert.match(await text('#resultAdhesion'), /Taxa única de adesão|Sem taxa de adesão/);
        assert.doesNotMatch(await text('#results'), /Custo de uso estimado|primeiro mês|custo total/i);
        assert.match(await text('.sector-warning'), /Atenção ao setor/);
        assert.match(await text('.sector-warning'), /Não cobre Roxo/i);
        assert.match(await text('.sector-warning'), /Não há alternativa que atenda ao setor dentro do orçamento/i);
    });

    it('casal com Kids vê assinatura, adesão, opcional e exemplo de ingresso separados', async () => {
        await setup();
        await startQuiz();
        const answers = NORMAL_ANSWERS.map((answer) => ({ ...answer }));
        answers[0] = { type: 'range', value: 12 };
        answers[3] = { type: 'option', index: 0 };
        answers[4] = { type: 'option', index: 2 };
        answers[11] = { type: 'option', index: 2 };
        await runQuiz(answers);
        await waitResults();

        const maxCard = await evaluate(() => {
            const cta = document.querySelector('.plan-cta[data-plan="Cabuloso Max"]');
            return cta?.closest('.plan')?.textContent || '';
        });
        assert.match(maxCard, /R\$\s*200,00 \/ mês/);
        assert.match(maxCard, /adesão:\s*R\$\s*30(?:,00)?/i);
        assert.match(maxCard, /Kids:\s*R\$\s*30,00\/mês por criança/);
        assert.match(maxCard, /R\$ 150 por R\$ 52,50/);
        assert.doesNotMatch(maxCard, /Custo de uso|R\$\s*305|R\$\s*335|primeiro mês/i);
        assert.equal(await evaluate(() => document.querySelectorAll('.plan-cost').length), 0);
    });

    it('comparativo apresenta a matriz oficial, contrato anual e checkout correto', async () => {
        await openPage('?preview');
        await waitResults();

        await click('#compareButton');
        await page.waitFor('document.querySelector("#comparisonModal")?.classList.contains("is-open")', 5000);
        assert.equal(await evaluate(() => document.body.style.overflow), 'hidden');
        assert.equal(await evaluate(() => document.querySelectorAll('#modalComparisonBody .comparison-table').length), 1);

        const columns = await evaluate(() => {
            const table = document.querySelector('.comparison-table');
            const names = [...table.querySelectorAll('thead th')]
                .slice(1)
                .map((th) => th.querySelector('.plan-name')?.textContent.trim() || th.textContent.trim());
            const result = {};
            names.forEach((name) => { result[name] = {}; });
            [...table.querySelectorAll('tbody tr')].forEach((row) => {
                const label = row.children[0].textContent.trim();
                names.forEach((name, index) => {
                    result[name][label] = row.children[index + 1].textContent.trim();
                });
            });
            return result;
        });

        assert.deepEqual(Object.keys(columns).sort(), [
            'Cabuloso', 'Cabuloso Cativo', 'Cabuloso Max', 'Meu Cruzeiro', 'Time do Povo'
        ].sort());

        assert.match(columns['Time do Povo']['Desconto na loja'], /Até 10%/);
        assert.match(columns['Time do Povo']['Prioridade / garantia'], /Prioridade 4/);
        assert.match(columns['Time do Povo']['Conteúdo e votação'], /✓/);
        assert.match(columns['Time do Povo']['Benefício de ingresso'], /popular/i);
        assert.match(columns['Time do Povo']['Contratação'], /semestral ou anual/i);
        assert.match(columns['Time do Povo']['Preço'], /Total anual/);

        assert.match(columns['Cabuloso Cativo']['Contratação'], /anual.*12x R\$\s*400,00/i);
        assert.match(columns['Cabuloso Cativo']['Preço'], /R\$\s*4\.800,00/);
        assert.match(columns['Cabuloso Cativo']['Preço'], /12x R\$\s*400,00/);
        assert.match(columns['Cabuloso Cativo']['Taxa de adesão'], /Sem taxa/);
        assert.match(columns['Cabuloso Cativo']['Benefício de ingresso'], /garantido/i);
        assert.match(columns['Cabuloso Cativo']['Benefício de ingresso'], /Sicoob.*Leste Inferior/i);
        assert.match(columns['Cabuloso Cativo']['Prioridade \/ garantia'], /Ingresso garantido/);

        const links = await evaluate(() => [...document.querySelectorAll('#modalComparisonBody a.plan-cta')]
            .map((link) => ({ plan: link.dataset.plan, href: link.href })));
        const cativo = links.find((link) => link.plan === 'Cabuloso Cativo');
        const timeDoPovo = links.find((link) => link.plan === 'Time do Povo');
        const meuCruzeiro = links.find((link) => link.plan === 'Meu Cruzeiro');
        assert.match(cativo.href, /plano_id=115/);
        assert.match(cativo.href, /intervalo_cobrancas=anual/);
        assert.match(timeDoPovo.href, /plano_id=34/);
        assert.match(timeDoPovo.href, /intervalo_cobrancas=anual/);
        assert.match(meuCruzeiro.href, /plano_id=21/);
        assert.match(meuCruzeiro.href, /intervalo_cobrancas=anual/);
        links.forEach((link) => assert.match(link.href, /utm_campaign=quiz_socio_5_estrelas/));

        await evaluate(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        });
        assert.equal(await evaluate(() => document.querySelector('#comparisonModal').classList.contains('is-open')), false);
        assert.equal(await evaluate(() => document.body.style.overflow), '');
    });

    it('teclado seleciona uma opção e libera Continuar', async () => {
        await setup();
        await startQuiz();
        await applyAnswer({ type: 'range', value: 15 });
        await click('#nextButton');
        await waitStep(2);
        await applyAnswer({ type: 'unknown' });
        await click('#nextButton');
        await waitStep(3);

        await evaluate(() => {
            const option = document.querySelector('.option[data-option-index="1"]');
            option.focus();
        });
        await dispatchEnter();

        assert.equal(await evaluate(() => document.activeElement?.classList.contains('option')), true);
        assert.equal(await evaluate(() => document.querySelector('.option[data-option-index="1"]').classList.contains('selected')), true);
        assert.equal(await evaluate(() => document.querySelector('#nextButton').disabled), false);
    });

    it('teclado abre e fecha o comparativo a partir do resultado', async () => {
        await openPage('?preview');
        await waitResults();

        await evaluate(() => document.querySelector('#compareButton').focus());
        await dispatchEnter();
        await page.waitFor('document.querySelector("#comparisonModal")?.classList.contains("is-open")', 5000);
        assert.equal(await evaluate(() => document.activeElement?.id), 'modalClose');

        await dispatchKey('Escape', 'Escape', 27);
        await page.waitFor('!document.querySelector("#comparisonModal").classList.contains("is-open")', 5000);
        assert.equal(await evaluate(() => document.activeElement?.id), 'compareButton');
        assert.equal(await evaluate(() => document.body.style.overflow), '');

        await dispatchKey('Tab', 'Tab', 9);
        assert.equal(await evaluate(() => document.activeElement?.id), 'subscribeButton');

        // QUIZ-015: o CTA principal é um link real focável; em preview a
        // navegação existe mas o evento permanece suprimido (coleta desligada).
        const foco = await evaluate(() => getComputedStyle(document.querySelector('#subscribeButton')).outlineWidth);
        assert.notEqual(foco, '0px', 'foco do CTA deve ser visível');
    });

    it('mobile e desktop não têm rolagem horizontal inesperada', async () => {
        await page.send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 1,
            mobile: true
        });
        try {
            await openPage('?preview');
            await waitResults();
            assert.equal(await evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);

            await click('#compareButton');
            await page.waitFor('document.querySelector("#comparisonModal")?.classList.contains("is-open")', 5000);
            assert.equal(await evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
            assert.equal(await evaluate(() => document.body.style.overflow), 'hidden');
            await page.waitFor("getComputedStyle(document.querySelector('.modal-content')).transform === 'matrix(1, 0, 0, 1, 0, 0)'");
            const tableText = await evaluate(() => {
                const detail = document.querySelector('.modal-body .comparison-detail');
                const style = getComputedStyle(detail);
                return {
                    size: parseFloat(style.fontSize),
                    maxHeight: style.maxHeight,
                    tableWidth: document.querySelector('.comparison-table').getBoundingClientRect().width,
                    planColumnWidth: document.querySelector('.comparison-table thead th:nth-child(2)').getBoundingClientRect().width,
                    ctaHeight: document.querySelector('.comparison-table .plan-cta').getBoundingClientRect().height
                };
            });
            assert.ok(tableText.size >= 14, 'detalhes do comparativo devem permanecer legíveis no celular');
            assert.equal(tableText.maxHeight, 'none', 'benefícios e condições devem aparecer completos');
            assert.ok(tableText.tableWidth >= 1120 && tableText.planColumnWidth >= 160, 'colunas devem usar rolagem, sem comprimir os textos');
            assert.ok(tableText.ctaHeight >= 44);
            await evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
        } finally {
            await page.send('Emulation.clearDeviceMetricsOverride');
        }

        await page.send('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });
        try {
            await setup();
            assert.equal(await evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
            await startQuiz();
            assert.equal(await evaluate(() => document.querySelector('#quizTitle').getBoundingClientRect().width > 200), true);
            assert.equal(await evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
        } finally {
            await page.send('Emulation.clearDeviceMetricsOverride');
        }
    });
});

/*
 * Isolamento da coleta GA4 (QUIZ-013): preview e ambientes de desenvolvimento
 * ficam fora da coleta de produção. Os testes de isolamento observam a decisão
 * original da página, sem habilitação artificial; o gtag mockado apenas
 * registra eventos quando a própria página habilita a coleta. Toda tentativa
 * de rede para destinos de analytics é interceptada antes da transmissão
 * (tests/cdp.js) e registrada como tentativa, não como ausência.
 */
describe('Quiz Sócio — isolamento da coleta GA4', { concurrency: 1 }, () => {
    let httpsServer;

    function ga4Attempts() {
        // O script de visitas da Vercel (/_vercel/insights/) não é coleta GA4;
        // o escopo do QUIZ-013 é a tag gtag.js e seus eventos.
        return page.analyticsAttempts.filter((url) => !url.includes('/_vercel/insights/'));
    }

    function observeDecision() {
        return evaluate(() => ({
            isPreview: Boolean(window.isPreview),
            coletaHabilitada: Boolean(window.coletaHabilitada),
            scriptsTag: document.querySelectorAll('script[src*="googletagmanager.com"]').length,
            comandos: window.dataLayer.map((item) => String(Array.prototype.slice.call(item)[0]))
        }));
    }

    function collectData() {
        return evaluate(() => document.cookie
            .split(';')
            .map((part) => part.trim())
            .filter(Boolean)
            .map((pair) => pair.split('=')[0]));
    }

    before(async () => {
        server = await startServer(ROOT);
        httpsServer = await startServer(ROOT, 0, { tls: true });
        page = await launchChrome({ chromePath: CHROME_PATH });
        page.exceptions = [];
        page.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
            page.exceptions.push(exceptionDetails.exception?.description || exceptionDetails.text || 'exceção');
        });
    });

    after(async () => {
        await page?.closeChildTabs();
        await page?.close();
        await server?.close();
        await httpsServer?.close();
    });

    beforeEach(() => {
        page.exceptions = [];
        page.analyticsAttempts = [];
        page.checkoutAttempts = [];
    });

    afterEach(() => {
        assert.deepEqual(page.exceptions, [], 'A página não deve lançar exceções');
        assert.deepEqual(page.analyticsResponses, [], 'Nenhuma resposta de analytics pode ser recebida no navegador de teste');
    });

    it('preview observa a decisão original da página e não inicializa a coleta', async () => {
        await openPage(`${server.baseUrl}/index.html?preview`);
        await waitResults();

        const estado = await observeDecision();
        assert.equal(estado.isPreview, true);
        assert.equal(estado.coletaHabilitada, false);
        assert.equal(estado.scriptsTag, 0);
        assert.deepEqual(estado.comandos, []);
        assert.deepEqual(ga4Attempts(), []);
        const eventos = await getEvents();
        assert.deepEqual(eventos, [], 'preview não envia nenhum evento do quiz');
    });

    it('loopback IPv6 ([::1]) e 127.0.0.2 ficam fora da coleta de produção', async () => {
        for (const host of ['[::1]', '127.0.0.2']) {
            await page.navigate(`http://${host}:${server.port}/index.html`);
            await installHooks();
            const estado = await observeDecision();
            assert.equal(estado.isPreview, false, `isPreview em ${host}`);
            assert.equal(estado.coletaHabilitada, false, `coleta desabilitada em ${host}`);
            assert.equal(estado.scriptsTag, 0, `sem tag gtag em ${host}`);
            assert.deepEqual(estado.comandos, [], `sem comandos de coleta em ${host}`);
            assert.deepEqual(ga4Attempts(), [], `nenhuma tentativa de coleta em ${host}`);
        }
    });

    it('host remoto fora da lista explícita fica fora da coleta', async () => {
        await page.navigate(`http://remoto-teste.example:${server.port}/index.html`);
        await installHooks();
        const estado = await observeDecision();
        assert.equal(estado.coletaHabilitada, false);
        assert.equal(estado.scriptsTag, 0);
        assert.deepEqual(estado.comandos, []);
        assert.deepEqual(ga4Attempts(), []);
    });

    it('produção (host publicado) habilita a coleta com inicialização única e o quiz funciona', async () => {
        await openPage(`${httpsServer.httpsBaseUrl}/index.html`);

        const estado = await observeDecision();
        assert.equal(estado.isPreview, false);
        assert.equal(estado.coletaHabilitada, true, 'o host publicado habilita a coleta sem habilitação artificial');
        assert.equal(estado.scriptsTag, 1, 'exatamente uma tentativa de injetar a tag');

        // Fila: js, set e config aparecem uma única vez, nesta ordem.
        assert.deepEqual(estado.comandos, ['js', 'set', 'config']);

        // Tentativa de coleta interceptada antes da transmissão (não basta ausência de resposta).
        assert.ok(page.analyticsAttempts.some((url) => url.includes('googletagmanager.com')), 'tag deve ser tentada');
        assert.deepEqual(page.analyticsResponses, [], 'nenhuma resposta de analytics é recebida');
        page.analyticsAttempts = [];

        // Mesmo com o carregamento da tag falhando, o quiz começa, responde e conclui.
        await startQuiz();
        await runQuiz(NORMAL_ANSWERS);
        await evaluate(() => {
            const button = document.querySelector('#nextButton');
            button.click();
            button.click();
        });
        await waitResults();

        assert.equal((await getEvents('quiz_start')).length, 1);
        assert.equal((await getEvents('quiz_answer')).length, 12);
        assert.equal((await getEvents('quiz_complete')).length, 1);
        assert.deepEqual(page.analyticsAttempts, [], 'nenhuma nova tentativa de coleta sai durante o quiz (gtag é substitudo)');
    });

    it('preview mantém a supressão mesmo em ambiente habilitado', async () => {
        await openPage(`${httpsServer.httpsBaseUrl}/index.html?preview`);
        await waitResults();

        const estado = await observeDecision();
        assert.equal(estado.isPreview, true);
        assert.equal(estado.coletaHabilitada, false);
        assert.equal(estado.scriptsTag, 0);
        assert.deepEqual(estado.comandos, []);
    });

    it('cookies anteriores permanecem e nenhum cookie novo de analytics surge nos modos excluídos', async () => {
        await page.send('Network.setCookies', {
            cookies: [{
                name: 'ga_preexistente_teste',
                value: 'GA1.1.424242424.1697000000',
                domain: '127.0.0.1',
                path: '/'
            }]
        });
        try {
            // Desenvolvimento local (localhost), modo normal — decisão original.
            await openPage(`${server.baseUrl}/index.html`);
            const nomes = await collectData();
            assert.ok(nomes.includes('ga_preexistente_teste'), 'cookie anterior não pode ser apagado');

            // Nenhum cookie de coleta GA4 é criado: _ga, _gid, _gat*, etc.
            assert.ok(!nomes.some((nome) => /^(?:_ga|_gid|_gat(?:_\w+)?)$/.test(nome)),
                `nenhum cookie de GA4 deve existir; vistos: ${nomes.join(', ')}`);

            // Preview também.
            await openPage(`${server.baseUrl}/index.html?preview`);
            const nomesAposPreview = await collectData();
            assert.ok(nomesAposPreview.includes('ga_preexistente_teste'));
            assert.ok(!nomesAposPreview.some((nome) => /^(?:_ga|_gid|_gat(?:_\w+)?)$/.test(nome)));
        } finally {
            await page.send('Network.clearBrowserCookies');
        }
    });

    it('arquivo local (file://) fica fora da coleta de produção', async () => {
        const fileUrl = `file://${path.join(ROOT, 'index.html')}`;
        await page.navigate(fileUrl);
        await installHooks();

        const estado = await observeDecision();
        assert.equal(estado.isPreview, false);
        assert.equal(estado.coletaHabilitada, false);
        assert.equal(estado.scriptsTag, 0);
        assert.deepEqual(estado.comandos, []);
        await startQuiz();
        await waitStep(1);
        assert.equal((await getEvents('quiz_start')).length, 0, 'desenvolvimento local não emite eventos');
    });

    it('a lista de ambientes habilitados é explícita no código', () => {
        const codigo = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
        assert.match(codigo, /AMBIENTES_HABILITADOS\s*=\s*\[\s*'quiz-socio\.vercel\.app'\s*\]/,
            'a lista de produção precisa existir e conter exatamente o host publicado');
    });
});

/*
 * Reconhecimento do preview somente por sinal explícito (QUIZ-012): o parâmetro
 * ?preview (em qualquer valor, inclusive ?preview=false) e a hash #preview
 * abrem o resultado fictício; parâmetros que apenas contêm "preview" no valor
 * (como utm_campaign=preview_newsletter) abrem o quiz normalmente.
 */
describe('Quiz Sócio — reconhecimento do preview', { concurrency: 1 }, () => {
    before(async () => {
        server = await startServer(ROOT);
        page = await launchChrome({ chromePath: CHROME_PATH });
        page.exceptions = [];
        page.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
            page.exceptions.push(exceptionDetails.exception?.description || exceptionDetails.text || 'exceção');
        });
    });

    after(async () => {
        await page?.closeChildTabs();
        await page?.close();
        await server?.close();
    });

    beforeEach(() => {
        page.exceptions = [];
        page.analyticsAttempts = [];
        page.checkoutAttempts = [];
    });

    afterEach(() => {
        assert.deepEqual(page.exceptions, [], 'A página não deve lançar exceções');
        assert.deepEqual(page.analyticsResponses, [], 'Nenhuma resposta de analytics pode ser recebida no navegador de teste');
    });

    it('modos explícitos de preview abrem o resultado fictício sem coleta', async () => {
        for (const modo of ['?preview', '?preview=1', '?preview=false', '#preview']) {
            await openPage(`${server.baseUrl}/index.html${modo}`);
            await waitResults();

            assert.equal(await evaluate(() => window.isPreview), true, `isPreview com ${modo}`);
            assert.equal(await evaluate(() => window.coletaHabilitada), false, `coleta suprimida com ${modo}`);
            assert.equal(await evaluate(() => document.querySelectorAll('script[src*="googletagmanager.com"]').length), 0, `sem tag com ${modo}`);
            assert.deepEqual(await getEvents(), [], `nenhum evento com ${modo}`);
            assert.deepEqual(page.analyticsAttempts.filter((url) => !url.includes('/_vercel/insights/')), [],
                `nenhuma tentativa de coleta GA4 com ${modo}`);
        }
    });

    it('parâmetros que apenas contêm "preview" no valor abrem o início normal', async () => {
        for (const url of ['?utm_campaign=preview_newsletter', '?utm_content=preview', '?notpreview=1']) {
            await openPage(`${server.baseUrl}/index.html${url}`);

            assert.equal(await evaluate(() => window.isPreview), false, `isPreview falso com ${url}`);
            assert.equal(await evaluate(() => Boolean(document.querySelector('#startButton'))), true, `início normal com ${url}`);
            assert.equal(await evaluate(() => document.querySelectorAll('.results').length), 0, `sem resultado com ${url}`);
        }
    });

    it('com UTMs falsos-positivos o quiz percorre completo e gera os eventos normais no caminho habilitado', async () => {
        await setup('?utm_campaign=preview_newsletter');
        await startQuiz();
        await runQuiz(NORMAL_ANSWERS);
        await evaluate(() => {
            const button = document.querySelector('#nextButton');
            button.click();
            button.click();
        });
        await waitResults();

        assert.equal(await evaluate(() => window.isPreview), false);
        assert.equal((await getEvents('quiz_start')).length, 1);
        assert.equal((await getEvents('quiz_answer')).length, 12);
        assert.equal((await getEvents('quiz_complete')).length, 1);
    });
});

/*
 * CTAs de contratação (QUIZ-015): o CTA principal é um link real com o destino
 * do catálogo. A navegação do link é interceptada antes da transmissão
 * (aba nova presa no renderizador e requisição falhada pelo CDP) e a fila de
 * eventos registra a origem do clique. Contrato de eventos usa habilitação
 * artificial (setup()); nada sai do navegador.
 */
describe('Quiz Sócio — CTAs de contratação', { concurrency: 1 }, () => {
    before(async () => {
        server = await startServer(ROOT);
        page = await launchChrome({ chromePath: CHROME_PATH });
        page.exceptions = [];
        page.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
            page.exceptions.push(exceptionDetails.exception?.description || exceptionDetails.text || 'exceção');
        });
    });

    after(async () => {
        await page?.closeChildTabs();
        await page?.close();
        await server?.close();
    });

    beforeEach(() => {
        page.exceptions = [];
        page.checkoutAttempts = [];
    });

    afterEach(async () => {
        assert.deepEqual(page.exceptions, [], 'A página não deve lançar exceções');
        assert.deepEqual(page.analyticsResponses, [], 'Nenhuma requisição de analytics pode sair do navegador de teste');
        await page.closeChildTabs();
    });

    async function concluirQuiz(respostas = NORMAL_ANSWERS) {
        await setup();
        await startQuiz();
        await runQuiz(respostas);
        await evaluate(() => document.querySelector('#nextButton').click());
        await waitResults();
    }

    it('teclado aciona a contratação com foco visível e dimensões preservadas', async () => {
        await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
        try {
            await concluirQuiz();
            const cta = await evaluate(() => {
                const link = document.querySelector('#subscribeButton');
                const rect = link.getBoundingClientRect();
                return { href: link.href, height: rect.height, width: rect.width };
            });
            assert.ok(cta.height >= 44, `altura do CTA no mobile deve ser ≥44 (observado ${cta.height})`);

            await evaluate(() => document.querySelector('#compareButton').focus());
            await dispatchKey('Tab', 'Tab', 9);
            assert.equal(await evaluate(() => document.activeElement?.id), 'subscribeButton');
            const foco = await evaluate(() => getComputedStyle(document.querySelector('#subscribeButton')).outlineWidth);
            assert.notEqual(foco, '0px', 'foco do CTA deve ser visível no teclado');
            await dispatchEnter();
            await waitUntil(() => page.checkoutAttempts.length === 1);
            assert.equal(page.checkoutAttempts[0], cta.href);
            assert.equal((await getEvents('quiz_subscribe_click')).length, 1);
            assert.equal((await getEvents('quiz_subscribe_click'))[0].params.cta_location, 'resultado');
        } finally {
            await page.send('Emulation.clearDeviceMetricsOverride');
            page.checkoutAttempts = [];
            // Fecha a aba de checkout aberta na primeira parte: com a aba
            // filha em primeiro plano, o Chrome suspende o requestAnimationFrame
            // da aba principal e a transição de seção da segunda parte trava.
            await page.closeChildTabs();
        }

        await concluirQuiz();
        const rect = await evaluate(() => document.querySelector('#subscribeButton').getBoundingClientRect().height);
        assert.ok(rect >= 44, `altura do CTA no desktop deve ser ≥44 (observado ${rect})`);
    });

    it('CTA da lista navega ao plano clicado e registra a origem lista', async () => {
        await concluirQuiz();

        const destino = await evaluate(() => {
            const cta = document.querySelector('#plansList a.plan-cta');
            return { href: cta.href, plano: cta.dataset.plan };
        });
        await click('#plansList a.plan-cta');
        await waitUntil(() => page.checkoutAttempts.length === 1);

        assert.equal(page.checkoutAttempts[0], destino.href, 'navegação deve ser o link do plano clicado');
        const evento = (await getEvents('quiz_subscribe_click'))[0];
        assert.equal(evento.params.cta_location, 'lista');
        assert.equal(evento.params.plan, destino.plano);
    });

    it('CTA do comparativo navega com origem comparativo', async () => {
        // Fluxo normal com habilitação artificial (setup): no modo preview os
        // eventos de GA4 são suprimidos por decisão do QUIZ-012, então o
        // registro de origem só pode ser observado fora do preview.
        await concluirQuiz();

        await click('#compareButton');
        await page.waitFor('document.querySelector("#comparisonModal")?.classList.contains("is-open")', 5000);

        const destino = await evaluate(() => {
            const cta = document.querySelector('#modalComparisonBody a.plan-cta');
            return { href: cta.href, plano: cta.dataset.plan };
        });
        await click('#modalComparisonBody a.plan-cta');
        await waitUntil(() => page.checkoutAttempts.length === 1);

        assert.equal(page.checkoutAttempts[0], destino.href, 'navegação deve ser o link do plano do comparativo');
        const evento = (await getEvents('quiz_subscribe_click'))[0];
        assert.equal(evento.params.cta_location, 'comparativo');
        assert.equal(evento.params.plan, destino.plano);
    });

    it('sem plano elegível, o estado indisponível não navega nem gera evento', async () => {
        // O catálogo atual sempre tem plano elegível (assinatura mínima de
        // R$ 12 contra orçamentos de R$ 40 ou mais); o estado indisponível é
        // simulado com a mesma forma que renderResults produz para o estado
        // sem plano (sem href, aria-disabled).
        await concluirQuiz();
        await evaluate(() => {
            const link = document.querySelector('#subscribeButton');
            link.removeAttribute('href');
            link.removeAttribute('data-plan');
            link.setAttribute('aria-disabled', 'true');
            link.textContent = 'Sem plano no orçamento';
        });

        await click('#subscribeButton');
        await click('#subscribeButton');

        assert.deepEqual(page.checkoutAttempts, [], 'estado indisponível não navega');
        assert.deepEqual(await getEvents('quiz_subscribe_click'), [], 'estado indisponível não gera evento de contratação');
        assert.equal(await page.evaluate('location.pathname'), '/index.html');
        assert.equal(await page.evaluate('document.querySelector("#subscribeButton").textContent.trim()'), 'Sem plano no orçamento');
    });
});
