import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { launchChrome } from './cdp.js';

test('servidor de desenvolvimento renderiza a entrada e inicia o quiz sem erros', async () => {
    const server = await createServer({ server: { host: '127.0.0.1', port: 0, open: false } });
    let page;
    const errors = [];
    try {
        await server.listen();
        page = await launchChrome({ chromePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
        page.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
            errors.push(exceptionDetails.exception?.description || exceptionDetails.text);
        });
        await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `
            window.__sizingUpdates = 0;
            new MutationObserver(changes => {
                window.__sizingUpdates += changes.filter(change =>
                    change.target.id === 'measure-quiz-quizTitle'
                    || change.target.parentElement?.id === 'measure-quiz-quizTitle').length;
            }).observe(document, {subtree:true, childList:true, characterData:true});
        ` });
        await page.navigate(`http://127.0.0.1:${server.httpServer.address().port}/`);
        try {
            await page.waitFor('Boolean(document.querySelector("#startButton"))', 5000);
        } catch {
            assert.fail(`Tela inicial não renderizou. Erros: ${errors.join('\n')}`);
        }
        assert.ok(await page.evaluate('window.__sizingUpdates <= 4'), 'abertura deve medir poucos candidatos, sem percorrer os 12 estados');
        await page.evaluate('document.querySelector("#startButton").click()');
        await page.waitFor('document.querySelector("#stepCounter")?.textContent.trim() === "Pergunta 1 de 12"', 5000);
        assert.deepEqual(errors, []);
    } finally {
        if (page) await page.close();
        await server.close();
    }
});
