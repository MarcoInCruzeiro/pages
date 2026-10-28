import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import engine from '../quiz-engine.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const hash = (text) => createHash('sha256').update(text).digest('hex');

/** Read public pages only. HTTP success does not confirm an offer or GA4 ingestion. */
export async function inspectPage(url, { fetchImpl = fetch, expectedSource = null } = {}) {
    try {
        const response = await fetchImpl(url, {
            method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(20000),
            headers: { 'User-Agent': 'QuizSocio-Verification/1.0' }
        });
        const html = await response.text();
        const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() ?? null;
        return {
            requestedUrl: url, finalUrl: response.url || url, status: response.status,
            title, sha256: hash(html),
            challenge: /challenge-platform|Just a moment/i.test(html),
            ...(expectedSource === null ? {} : {
                matchesLocalSource: html === expectedSource,
                contractMarkers: Object.fromEntries([
                    'affinity_index', 'score_semantics', 'catalog_version',
                    'rules_version', 'quiz-engine.js', 'AMBIENTES_HABILITADOS'
                ].map((marker) => [marker, html.includes(marker)]))
            })
        };
    } catch (error) {
        return { requestedUrl: url, status: null, error: error.message };
    }
}

export async function verifyExternal({ publicUrl = 'https://quiz-socio.vercel.app/', fetchImpl = fetch } = {}) {
    const html = await readFile(path.join(root, 'index.html'), 'utf8');
    const [published, ...checkouts] = await Promise.all([
        inspectPage(publicUrl, { fetchImpl, expectedSource: html }),
        ...engine.plans.map(async (plan) => ({
            plan: plan.slug,
            ...await inspectPage(plan.contratacao.link, { fetchImpl }),
            offerConfirmed: false,
            remaining: 'Conferir plano, modalidade e preço visíveis antes de qualquer contratação.'
        }))
    ]);
    return {
        checkedAt: new Date().toISOString(),
        method: 'HTTP GET; sem login, execução de scripts, formulário ou compra.',
        rulesVersion: engine.RULES_VERSION, catalogVersion: engine.CATALOG_VERSION,
        published, checkouts,
        ga4IngestionConfirmed: false, crossDomainIdentityConfirmed: false,
        remaining: 'Ofertas e identidade requerem observação no destino; recebimento requer GA4.'
    };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const outputFlag = process.argv.indexOf('--output');
        const urlFlag = process.argv.indexOf('--public-url');
        const output = outputFlag < 0 ? null : process.argv[outputFlag + 1];
        if (outputFlag >= 0 && (!output || output.startsWith('--'))) throw new Error('--output exige um caminho.');
        const publicUrl = urlFlag < 0 ? undefined : process.argv[urlFlag + 1];
        if (urlFlag >= 0 && !/^https:\/\//.test(publicUrl ?? '')) throw new Error('--public-url exige uma URL HTTPS.');
        const report = await verifyExternal({ publicUrl });
        if (output) {
            await mkdir(path.dirname(path.resolve(output)), { recursive: true });
            await writeFile(output, JSON.stringify(report, null, 2) + '\n');
        }
        console.log(JSON.stringify(report, null, 2));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
