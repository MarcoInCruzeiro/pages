/** Contrato local vigente; executar com pacote preparado da configuração atual. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const project = path.resolve(__dirname, '..');
const { startServer } = require(path.join(project, 'tests/static-server.js'));
const { launchChrome } = require(path.join(project, 'tests/cdp.js'));

(async () => {
    if (!process.argv[2] || !process.argv[3]) throw Error('Uso: node scripts/verify-package-contract.cjs DIRETORIO_DO_PACOTE RELATORIO.json');
    const candidate = path.resolve(process.argv[2]);
    const manifest = JSON.parse(fs.readFileSync(path.join(candidate, 'manifest.json'), 'utf8'));
    const revision = require(path.join(project, 'config/revision.json'));
    const ga4 = require(path.join(project, 'config/ga4/ga4.json'));
    const names = Object.fromEntries(ga4.eventos.map(event => [event.chave, event.nome]));
    assert.equal(manifest.ga4Version, revision.ga4Version, 'Prepare um pacote da revisão GA4 atual.');
    assert.equal(manifest.configurationHashes.aggregate, revision.hashes.aggregate, 'O pacote pertence a outra configuração.');
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
        assert.equal(events.filter(e => names.inicio_do_quiz === e.name).length, 1);
        const answerEvents = events.filter(e => names.resposta_do_quiz === e.name);
        assert.equal(answerEvents.length, 12);
        questions.forEach((question, index) => {
            assert.equal(answerEvents[index].params.pergunta_do_quiz, question.key);
            assert.equal(answerEvents[index].params.valor_da_resposta, String(answers[question.key]));
        });
        const completed = events.filter(e => names.quiz_concluido === e.name);
        assert.equal(completed.length, 1);
        const payload = completed[0].params;
        assert.equal(payload.versao_das_regras, manifest.rulesVersion);
        assert.equal(payload.versao_do_catalogo, manifest.catalogVersion);
        assert.equal(payload.semantica_do_score, 'indice_afinidade_estimado');
        assert.equal(payload.indice_de_afinidade, payload.compatibilidade);
        assert.equal(payload.plano_recomendado, 'Time do Povo');
        assert.equal(Object.keys(payload).length, 20);
        for (const question of questions) {
            assert.equal(payload[`resposta_${ga4.respostas[question.key]}`], String(answers[question.key]));
        }
        const link = await page.evaluate('document.querySelector("#subscribeButton").href');
        assert.equal(new URL(link).searchParams.get('plano_id'), '34');
        assert.deepEqual(errors, []);
        assert.deepEqual(page.analyticsAttempts, []);
        const report = {
            checkedAt: new Date().toISOString(), scope: 'Pacote local isolado; não é execução do domínio público.',
            candidateDirectory: candidate, versions: { catalog: manifest.catalogVersion, rules: manifest.rulesVersion, ga4: manifest.ga4Version },
            collectionMode: 'gtag substituído por captura local e habilitação artificial; destinos reais bloqueados pelo harness.',
            eventCounts: { [names.inicio_do_quiz]: 1, [names.resposta_do_quiz]: 12, [names.quiz_concluido]: 1 }, completePayload: payload,
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
