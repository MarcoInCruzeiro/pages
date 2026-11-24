const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const project = path.resolve(__dirname, '../../../..');
const { startServer } = require(path.join(project, 'tests/static-server.js'));
const { launchChrome } = require(path.join(project, 'tests/cdp.js'));

(async () => {
    if (!process.argv[2] || !process.argv[3]) throw Error('Uso: node verify-isolated-package.cjs DIRETORIO_DO_PACOTE RELATORIO.json');
    const candidate = path.resolve(process.argv[2]);
    const manifest = JSON.parse(fs.readFileSync(path.join(candidate, 'manifest.json'), 'utf8'));
    const answers = require(path.join(project, 'tests/fixtures/four-plans/historical.json')).scenarios.find(s => s.id === 'CAL-02').answers;
    const server = await startServer(path.join(candidate, 'public'));
    let page;
    const errors = [];
    try {
        page = await launchChrome({ chromePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
        page.on('Runtime.exceptionThrown', ({ exceptionDetails }) => errors.push(exceptionDetails.exception?.description || exceptionDetails.text));
        await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
        await page.navigate(server.baseUrl);
        await page.waitFor('Boolean(window.QuizEngine && document.querySelector("#startButton"))');
        assert.equal(await page.evaluate('window.coletaHabilitada'), false);
        await page.evaluate(`window.__events = []; window.gtag = (kind, name, params) => {
            if (kind === 'event') window.__events.push({ name, params: params || {} });
        }; window.coletaHabilitada = true;`);
        const questions = await page.evaluate('window.QuizEngine.questions');
        await page.evaluate('document.querySelector("#startButton").click()');
        for (const [index, question] of questions.entries()) {
            await page.waitFor(`document.querySelector('#stepCounter')?.textContent.trim() === 'Pergunta ${index + 1} de ${questions.length}'`);
            const value = answers[question.key];
            if (question.type === 'range') {
                await page.evaluate(`(() => { const input = document.querySelector('#rangeInput'); input.value = ${JSON.stringify(String(value))}; input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
            } else {
                const option = question.options.findIndex(item => Object.is(item.value, value));
                assert.ok(option >= 0, question.key);
                await page.evaluate(`document.querySelector('.option[data-option-index="${option}"]').click()`);
            }
            await page.waitFor('!document.querySelector("#nextButton").disabled');
            await page.evaluate('document.querySelector("#nextButton").click()');
        }
        await page.waitFor('Boolean(document.querySelector("#subscribeButton"))');
        const events = await page.evaluate('window.__events');
        assert.equal(events.filter(e => e.name === 'quiz_start').length, 1);
        const answerEvents = events.filter(e => e.name === 'quiz_answer');
        assert.equal(answerEvents.length, 12);
        questions.forEach((question, index) => {
            assert.equal(answerEvents[index].params.quiz_question, question.key);
            assert.equal(answerEvents[index].params.quiz_answer, String(answers[question.key]));
        });
        const completed = events.filter(e => e.name === 'quiz_complete');
        assert.equal(completed.length, 1);
        const payload = completed[0].params;
        assert.equal(payload.rules_version, manifest.rulesVersion);
        assert.equal(payload.catalog_version, manifest.catalogVersion);
        assert.equal(payload.score_semantics, 'indice_afinidade_estimado');
        assert.equal(payload.affinity_index, payload.compatibility);
        assert.equal(payload.recommended_plan, 'Time do Povo');
        assert.equal(Object.keys(payload).length, 20);
        const link = await page.evaluate('document.querySelector("#subscribeButton").href');
        assert.equal(new URL(link).searchParams.get('plano_id'), '34');
        assert.deepEqual(errors, []);
        assert.deepEqual(page.analyticsAttempts, []);
        const report = {
            checkedAt: new Date().toISOString(), scope: 'Pacote local isolado; não é execução do domínio público.',
            candidateDirectory: candidate, versions: { catalog: manifest.catalogVersion, rules: manifest.rulesVersion, ga4: manifest.ga4Version },
            collectionMode: 'gtag substituído por captura local e habilitação artificial; destinos reais bloqueados pelo harness.',
            eventCounts: { quiz_start: 1, quiz_answer: 12, quiz_complete: 1 }, completePayload: payload,
            ctaPlanId: new URL(link).searchParams.get('plano_id'), runtimeErrors: errors, analyticsAttempts: page.analyticsAttempts,
            isolatedPackageContractVerified: true, publishedRuntimeContractVerified: false, ga4IngestionConfirmed: false
        };
        fs.writeFileSync(process.argv[3], JSON.stringify(report, null, 2) + '\n');
        console.log('PASS: pacote isolado conclui 12 perguntas; versões, 20 parâmetros e CTA do Time do Povo conferidos; nenhum envio GA4.');
    } finally {
        if (page) await page.close();
        await server.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
