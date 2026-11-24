import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const publicFile = (name) => typeof name === 'string' && path.posix.normalize(name) === name && !name.split('/').includes('..')
    && (['index.html', 'build-manifest.json'].includes(name)
        || /^(assets|img)\/[\p{L}\p{N} _./-]+\.(js|css|png|jpe?g|svg|webp|ico|mp4|woff2?|ttf|otf)$/u.test(name));

/** Compare a prepared package with public bytes; never execute its scripts or send analytics. */
export async function verifyPublishedBuild({ packageDirectory, publicUrl = 'https://quiz-socio.vercel.app/', fetchImpl = fetch }) {
    const directory = path.resolve(packageDirectory);
    const manifest = JSON.parse(await readFile(path.join(directory, 'manifest.json'), 'utf8'));
    const files = manifest.files;
    if (!Array.isArray(files) || new Set(files.map((file) => file.path)).size !== files.length
        || files.some((file) => !publicFile(file.path) || !/^[a-f0-9]{64}$/.test(file.sha256))) {
        throw new Error('Manifesto inválido: caminhos públicos únicos e hashes SHA-256 são obrigatórios.');
    }
    if (!['index.html', 'build-manifest.json'].every((name) => files.some((file) => file.path === name))
        || !files.some((file) => /^assets\/.*\.js$/.test(file.path))) {
        throw new Error('Pacote incompleto: HTML, manifesto de build e JavaScript compilado são obrigatórios.');
    }
    // Verify every local byte before using the manifest as an expected deployment.
    for (const file of files) {
        const bytes = await readFile(path.join(directory, 'public', file.path));
        if (sha256(bytes) !== file.sha256 || bytes.length !== file.bytes) {
            throw new Error(`Pacote local alterado: ${file.path}. Prepare um candidato novo.`);
        }
    }
    const build = JSON.parse(await readFile(path.join(directory, 'public/build-manifest.json'), 'utf8'));
    const expectedVersions = { catalogVersion: manifest.catalogVersion, rulesVersion: manifest.rulesVersion, ga4Version: manifest.ga4Version };
    if (!manifest.configurationHashes?.aggregate || build.hashes?.aggregate !== manifest.configurationHashes.aggregate
        || Object.entries(expectedVersions).some(([key, value]) => !value || build.versions?.[key] !== value)) {
        throw new Error('O manifesto do pacote e o manifesto do build não identificam a mesma revisão.');
    }

    const base = new URL(publicUrl);
    if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) throw new Error('URL pública HTTP(S) sem credenciais é obrigatória.');
    let publishedVersions = null;
    let legacyScriptDetected = false;
    async function inspect(file) {
        const url = new URL(file.path === 'index.html' ? './' : file.path, base).href;
        try {
            const response = await fetchImpl(url, {
                method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(20000),
                headers: { 'User-Agent': 'SeuPlanoIdeal-BuildVerification/1.0', 'Cache-Control': 'no-cache' }
            });
            const bytes = Buffer.from(await response.arrayBuffer());
            if (file.path === 'index.html') legacyScriptDetected = /<script\b[^>]*\bsrc\s*=\s*["'][^"']*quiz-engine\.js(?:[?"'])/i.test(bytes.toString('utf8'));
            if (file.path === 'build-manifest.json' && response.status === 200) {
                try {
                    const remote = JSON.parse(bytes.toString('utf8'));
                    publishedVersions = Object.fromEntries(Object.keys(expectedVersions).map((key) => [key, remote.versions?.[key] ?? null]));
                } catch { /* Hash/status still identify an invalid or non-JSON response. */ }
            }
            const actualHash = sha256(bytes);
            return { path: file.path, requestedUrl: url, finalUrl: response.url || url, status: response.status,
                expectedSha256: file.sha256, actualSha256: actualHash, bytes: bytes.length,
                matches: response.status === 200 && actualHash === file.sha256 };
        } catch (error) {
            return { path: file.path, requestedUrl: url, status: null, matches: false, error: error.message };
        }
    }
    const identityFiles = files.filter((file) => ['index.html', 'build-manifest.json'].includes(file.path));
    const checked = await Promise.all(identityFiles.map(inspect));
    const otherFiles = files.filter((file) => !identityFiles.includes(file));
    const identityMatches = checked.every((file) => file.matches);
    // A different entry point/manifest is already a failed comparison; do not probe obsolete hashed assets.
    if (identityMatches) checked.push(...await Promise.all(otherFiles.map(inspect)));
    return {
        checkedAt: new Date().toISOString(), publicUrl: base.href,
        method: 'HTTP GET de arquivos públicos e SHA-256; sem executar scripts ou enviar eventos.',
        expectedVersions, publishedVersions, configurationHash: manifest.configurationHashes.aggregate,
        sourceCommit: manifest.commit, workingTreeHasChanges: manifest.workingTreeHasChanges,
        candidateReleaseApproved: manifest.releaseApproved, diagnostic: manifest.diagnostic,
        matchesPreparedBuild: identityMatches && checked.every((file) => file.matches),
        legacyScriptDetected, files: checked, skippedFiles: identityMatches ? [] : otherFiles.map((file) => file.path),
        runtimeContractVerified: false, ga4IngestionConfirmed: false,
        remaining: 'Igualdade estática não comprova execução do contrato nem recebimento no GA4; validar em navegador e DebugView.'
    };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const args = process.argv.slice(2), options = {};
        let output;
        while (args.length) {
            const flag = args.shift(), value = args.shift();
            if (!['--package', '--public-url', '--output'].includes(flag) || !value || value.startsWith('--')) {
                throw new Error('Uso: node scripts/verify-published-build.mjs --package DIRETORIO [--public-url URL] [--output RELATORIO.json]');
            }
            if (flag === '--package') options.packageDirectory = value;
            if (flag === '--public-url') options.publicUrl = value;
            if (flag === '--output') output = value;
        }
        if (!options.packageDirectory) throw new Error('--package é obrigatório; use o diretório que contém manifest.json e public/.');
        const report = await verifyPublishedBuild(options);
        if (output) {
            await mkdir(path.dirname(path.resolve(output)), { recursive: true });
            await writeFile(output, JSON.stringify(report, null, 2) + '\n');
        }
        console.log(JSON.stringify(report, null, 2));
        if (!report.matchesPreparedBuild) process.exitCode = 2;
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}
