const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { launchChrome, delay } = require('../tests/cdp.js');
const { startServer } = require('../tests/static-server.js');

(async () => {
    const root = path.resolve(process.argv[2] || 'dist');
    const output = path.resolve(process.argv[3] || '/tmp/quiz-layout');
    await fs.mkdir(output, { recursive: true });
    const server = await startServer(root);
    let page;
    const errors = [], missingAssets = [], rows = [];
    try {
        page = await launchChrome({ chromePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
        page.on('Runtime.exceptionThrown', e => errors.push(e.exceptionDetails.exception?.description || e.exceptionDetails.text));
        page.on('Network.responseReceived', ({ response }) => {
            if (response.url.startsWith(server.baseUrl) && response.status >= 400) missingAssets.push(response.url);
        });
        await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
        for (const width of [320, 390, 768, 1280]) {
            await page.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
            await page.navigate(server.baseUrl);
            await page.waitFor('Boolean(document.querySelector("#startButton"))');
            await delay(100);
            if ([390,1280].includes(width)) await page.screenshot(path.join(output, `${width}-hero.png`));
            const initial = await page.evaluate('document.querySelector("#rodape").getBoundingClientRect().top + scrollY');
            await page.evaluate('document.querySelector("#startButton").click()');
            for (let step = 1; step <= 12; step++) {
                await page.waitFor(`document.querySelector('#stepCounter')?.textContent.trim() === 'Pergunta ${step} de 12'`);
                const geometry = await page.evaluate(`(() => {
                    const card = document.querySelector('.quiz-card').getBoundingClientRect();
                    const main = document.querySelector('main').getBoundingClientRect();
                    return { footer: document.querySelector('#rodape').getBoundingClientRect().top + scrollY,
                        cardHeight: card.height, reserve: main.height, clipped: card.bottom > main.bottom + 1,
                        overflow: document.documentElement.scrollWidth > innerWidth + 1 };
                })()`);
                assert.ok(Math.abs(geometry.footer - initial) <= 1, `${width}px pergunta ${step}: rodapé mudou`);
                assert.equal(geometry.clipped || geometry.overflow, false, `${width}px pergunta ${step}: recorte/overflow`);
                rows.push({ width, step, ...geometry });
                if (step === 11 && [390,1280].includes(width)) await page.screenshot(path.join(output, `${width}-question.png`));
                await page.evaluate(`(() => {
                    const range = document.querySelector('#rangeInput');
                    if (range) { range.value = '15'; range.dispatchEvent(new Event('input', {bubbles:true})); }
                    else document.querySelector('.option').click();
                })()`);
                await page.waitFor('!document.querySelector("#nextButton").disabled');
                await page.evaluate('document.querySelector("#nextButton").click()');
            }
            await page.waitFor('Boolean(document.querySelector("#compareButton, .conflict-panel"))');
            if (await page.evaluate('Boolean(document.querySelector(".conflict-panel"))')) await page.evaluate('document.querySelector("#nextButton").click()');
            await page.waitFor('Boolean(document.querySelector("#compareButton"))');
            await page.evaluate('document.querySelector("#compareButton").click()');
            await page.waitFor('Boolean(document.querySelector("#comparisonModal.is-open"))');
            await delay(100);
            if ([390,1280].includes(width)) await page.screenshot(path.join(output, `${width}-comparison.png`));
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(missingAssets, []);
        await fs.writeFile(path.join(output, 'layout.json'), JSON.stringify({rows, errors, missingAssets}, null, 2) + '\n');
        console.log(`PASS: 48 perguntas, quatro larguras, rodapé estável, sem recortes, assets locais resolvidos (${output})`);
    } finally {
        if (page) await page.close();
        await server.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
