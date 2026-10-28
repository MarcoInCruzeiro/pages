import { readFile, mkdir, readdir, lstat, copyFile, writeFile, rm, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectConfiguration, inspectQuality, inspectBuildInputs, canonicalize, projectRoot } from './config-release.mjs';

const exec = promisify(execFile);
const hash = (data) => createHash('sha256').update(data).digest('hex');
async function artifactFiles(root, directory = '') {
    const entries = await readdir(path.join(root, directory), { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const relative = path.join(directory, entry.name);
        const source = path.join(root, relative);
        if ((await lstat(source)).isSymbolicLink()) throw new Error(`Asset simbólico não é permitido: ${relative}`);
        if (entry.isDirectory()) files.push(...await artifactFiles(root, relative));
        else if (entry.isFile()) {
            if (!['index.html', 'build-manifest.json'].includes(relative)
                && !/^(assets|img)\/[\p{L}\p{N} _./-]+\.(js|css|png|jpe?g|svg|webp|ico|mp4|woff2?|ttf|otf)$/u.test(relative)) {
                throw new Error(`Arquivo fora do contrato público: ${relative}`);
            }
            files.push(relative);
        }
    }
    return files.sort();
}

/** Package only a verified compiled snapshot. Diagnostic packages are never approved for release. */
export async function prepareRelease(output, { diagnostic = false, buildDirectory = path.join(projectRoot, 'dist') } = {}) {
    const destination = path.resolve(output);
    if (destination === projectRoot || destination.startsWith(projectRoot + path.sep)) {
        throw new Error('O pacote deve ser preparado fora do diretório do projeto.');
    }
    await mkdir(destination, { recursive: true });
    if ((await readdir(destination)).length) throw new Error('O diretório de saída precisa estar vazio.');
    const inspection = inspectConfiguration();
    if (inspection.pendingChanges) throw new Error('Revisão desatualizada: prepare a configuração antes da entrega.');
    const buildManifest = JSON.parse(await readFile(path.join(buildDirectory, 'build-manifest.json'), 'utf8'));
    if (buildManifest.hashes?.aggregate !== inspection.hashes.aggregate
        || canonicalize(buildManifest.versions) !== canonicalize(inspection.versions)
        || buildManifest.buildInputsHash !== inspectBuildInputs()) {
        throw new Error('Build desatualizado: a configuração compilada difere do candidato.');
    }
    const quality = await inspectQuality(inspection);
    if (!quality.releaseApproved && !diagnostic) throw new Error('Entrega bloqueada: regressões precisam de aceite explícito ou métricas estão abaixo do piso.');
    const files = await artifactFiles(buildDirectory);
    if (!files.includes('index.html') || !files.some((file) => /^assets\/.*\.js$/.test(file))) {
        throw new Error('Artefato Vite incompleto: HTML e JavaScript compilado são obrigatórios.');
    }
    const html = await readFile(path.join(buildDirectory, 'index.html'), 'utf8');
    if (/src\/main\.js|quiz-engine\.js/.test(html)) throw new Error('HTML de fonte não pode ser entregue como build.');
    const manifest = {
        preparedAt: new Date().toISOString(),
        commit: (await exec('git', ['rev-parse', 'HEAD'], { cwd: projectRoot })).stdout.trim(),
        workingTreeHasChanges: Boolean((await exec('git', ['status', '--porcelain', '--', '.'], { cwd: projectRoot })).stdout.trim()),
        rulesVersion: inspection.versions.rulesVersion, catalogVersion: inspection.versions.catalogVersion,
        ga4Version: inspection.versions.ga4Version, configurationHashes: inspection.hashes,
        releaseApproved: quality.releaseApproved, diagnostic,
        quality: { metricsPassed: quality.metricsPassed, regressionIds: quality.regressionIds, reviewAccepted: quality.reviewAccepted, referenceHashes: quality.referenceHashes },
        scope: quality.releaseApproved ? 'Candidato local validado; publicação e aceite externo são ações separadas.' : 'Diagnóstico local não aprovado; entrega bloqueada por revisão de qualidade.',
        files: []
    };
    const temporary = path.join(destination, '.prepare');
    await mkdir(path.join(temporary, 'public'), { recursive: true });
    try {
        for (const relative of files) {
            const data = await readFile(path.join(buildDirectory, relative));
            const target = path.join(temporary, 'public', relative);
            await mkdir(path.dirname(target), { recursive: true });
            await copyFile(path.join(buildDirectory, relative), target);
            manifest.files.push({ path: relative, bytes: data.length, sha256: hash(data) });
        }
        await writeFile(path.join(temporary, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
        await rename(path.join(temporary, 'public'), path.join(destination, 'public'));
        await rename(path.join(temporary, 'manifest.json'), path.join(destination, 'manifest.json'));
    } catch (error) {
        await rm(path.join(destination, 'public'), { recursive: true, force: true });
        await rm(path.join(destination, 'manifest.json'), { force: true });
        throw error;
    } finally { await rm(temporary, { recursive: true, force: true }); }
    return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const flag = process.argv.indexOf('--output');
        const output = flag < 0 ? null : process.argv[flag + 1];
        if (!output || output.startsWith('--')) throw new Error('Uso: npm run release:prepare -- --output DIRETORIO_VAZIO');
        const manifest = await prepareRelease(output, { diagnostic: process.argv.includes('--diagnostic') });
        console.log(`Candidato preparado em ${path.resolve(output)}: ${manifest.files.length} arquivos compilados; aprovação de entrega: ${manifest.releaseApproved}; sem publicação.`);
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}
