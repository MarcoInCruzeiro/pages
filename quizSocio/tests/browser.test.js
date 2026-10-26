/*
 * Testes de navegador do Quiz Sócio 5 Estrelas.
 *
 * Usam o Chrome instalado via CDP, sem Playwright. Cada teste recarrega a
 * página, instala captura local de analytics e interage com o DOM real.
 * Nenhum evento é enviado ao GA4 e nenhum checkout é concluído.
 */
const assert = require('node:assert/strict');
const path = require('node:path');
const { describe, it, before, after, beforeEach, afterEach } = require('node:test');

const engine = require('../quiz-engine.js');
const { launchChrome } = require('./cdp.js');
const { startServer } = require('./static-server.js');

const ROOT = path.resolve(__dirname, '..');
const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';

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

async function setup(url = '') {
    await page.navigate(`${server.baseUrl}/index.html${url}`);
    await installHooks();
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
    });

    afterEach(() => {
        assert.deepEqual(page.exceptions, [], 'A página não deve lançar exceções');
        assert.deepEqual(page.analyticsResponses, [], 'Nenhuma requisição de analytics pode sair do navegador de teste');
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
        assert.equal(await text('#stepCounter'), 'Pergunta 2 de 12');
        assert.match(await text('#quizTitle'), /últimos 15 meses/);

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
        assert.match(await text('#quizTitle'), /confirme suas respostas/i);
        assert.equal(await evaluate(() => document.querySelectorAll('.conflict-panel li').length), 2);

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

        assert.match(await text('#scoreExplainer'), /afinidade estimada/i);
        assert.match(await text('#scoreExplainer'), /não é probabilidade/i);
        assert.match(await text('#assumptionNote'), /R\$\s*150/);
        assert.match(await text('#assumptionNote'), /R\$\s*40/);
        assert.match(await text('#assumptionNote'), /ingressos das crianças não incluídos/);
        assert.match(await text('#resultSummary'), /de 100 de afinidade estimada/);
        assert.match(await text('.plan-cost'), /Custo de uso estimado/);

        await click('#subscribeButton');
        const subscribe = await getEvents('quiz_subscribe_click');
        assert.equal(subscribe.length, 1);
        assert.equal(subscribe[0].params.cta_location, 'resultado');
        const opened = await page.evaluate('window.__opened || []');
        assert.equal(opened.length, 1);
        assert.match(opened[0], /socio\.cruzeiro\.com\.br/);
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
    });

    it('orçamento restrito, setor incompatível e custo de uso aparecem separados', async () => {
        await setup();
        await startQuiz();
        await runQuiz(BUDGET_PURPLE_ANSWERS);
        await evaluate(() => document.querySelector('#nextButton').click());
        await waitResults();

        assert.match(await evaluate(() => document.querySelector('#resultLogo').alt), /Time do Povo/);
        assert.match(await text('#resultPrice'), /R\$\s*40,00.*mês/);
        assert.match(await text('#resultContract'), /Total anual/);
        assert.match(await text('#results'), /ingresso popular/i);
        assert.match(await text('#results'), /Custo de uso estimado/);
        assert.match(await text('.sector-warning'), /Atenção ao setor/);
        assert.match(await text('.sector-warning'), /Não cobre Roxo/i);
        assert.match(await text('.sector-warning'), /Não há alternativa que atenda ao setor dentro do orçamento/i);
    });

    it('comparativo apresenta a matriz oficial, contrato anual e checkout correto', async () => {
        await setup('?preview');
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
        await setup('?preview');
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
    });

    it('mobile e desktop não têm rolagem horizontal inesperada', async () => {
        await page.send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 1,
            mobile: true
        });
        try {
            await setup('?preview');
            await waitResults();
            assert.equal(await evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);

            await click('#compareButton');
            await page.waitFor('document.querySelector("#comparisonModal")?.classList.contains("is-open")', 5000);
            assert.equal(await evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
            assert.equal(await evaluate(() => document.body.style.overflow), 'hidden');
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
