// Diagnóstico comparável de abertura; analytics e checkout interceptados pelo CDP.
const fs = require('node:fs/promises');
const path = require('node:path');
const { launchChrome, delay } = require('../tests/cdp.js');
const { startServer } = require('../tests/static-server.js');

(async () => {
    const root = path.resolve(process.argv[2] || 'dist');
    const output = process.argv[3];
    if (!output) throw new Error('Uso: node scripts/profile-startup.cjs DIRETORIO_BUILD RELATORIO.json');
    const server = await startServer(root);
    let page;
    try {
        page = await launchChrome({ chromePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
        await page.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
        await page.send('Emulation.setCPUThrottlingRate', { rate: 6 });
        await page.send('Network.setCacheDisabled', { cacheDisabled: true });
        await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `
            window.__startupTasks = [];
            new PerformanceObserver(list => window.__startupTasks.push(...list.getEntries().map(e => ({start: e.startTime, duration: e.duration}))))
                .observe({ type: 'longtask', buffered: true });
        ` });
        const samples = [];
        for (let index = 0; index < 3; index++) {
            await page.navigate(server.baseUrl);
            await page.waitFor('Boolean(document.querySelector("#startButton"))', 20000);
            await delay(700);
            samples.push(await page.evaluate('({tasks: window.__startupTasks, navigation: performance.getEntriesByType("navigation")[0].duration})'));
        }
        const maxima = samples.map(s => Math.max(0, ...s.tasks.map(t => t.duration)));
        const report = { measuredAt: new Date().toISOString(), cpu: 6, viewport: [1280, 900], samples,
            largestTasksMs: maxima, medianLargestTaskMs: [...maxima].sort((a,b) => a-b)[1],
            limitations: 'Chrome headless, fontes externas interceptadas, cache HTTP desativado. Mede abertura sob CPU limitada; não comprova resolução da travada persistente.' };
        await fs.mkdir(path.dirname(path.resolve(output)), { recursive: true });
        await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n');
        console.log(JSON.stringify({ output, maxima, median: report.medianLargestTaskMs }));
    } finally {
        if (page) await page.close();
        await server.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
