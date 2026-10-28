import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { canonicalize, inspectConfiguration, sha256 } from '../scripts/config-release.mjs';

const exec = promisify(execFile);
const project = path.resolve(new URL('../', import.meta.url).pathname);

test('identidade canônica mantém tipos e ordem de arrays sem depender de ordem das propriedades', () => {
    assert.equal(sha256({ b: 2, a: [true, '1', 1] }), sha256({ a: [true, '1', 1], b: 2 }));
    assert.notEqual(sha256([true, '1', 1]), sha256([true, 1, '1']));
    assert.throws(() => canonicalize({ score: Infinity }), /JSON finitos/);
    assert.throws(() => canonicalize({ score: NaN }), /JSON finitos/);
});

test('mudar só GA4 não altera a identidade das regras nem a revisão comercial', () => {
    const initial = inspectConfiguration();
    const changed = structuredClone(initial.configuration);
    changed.ga4.propriedade.measurementId = 'G-TEST12345';
    const comparison = inspectConfiguration({ configuration: changed });
    assert.equal(comparison.hashes.rules, initial.hashes.rules);
    assert.equal(comparison.hashes.catalog, initial.hashes.catalog);
    assert.notEqual(comparison.hashes.ga4, initial.hashes.ga4);
    assert.notEqual(comparison.hashes.aggregate, initial.hashes.aggregate);
});

test('comandos locais versionam, preservam backup e restauram sem escrever no projeto real', async () => {
    const isolated = await fs.mkdtemp(path.join(os.tmpdir(), 'quiz-config-transaction-'));
    try {
        for (const directory of ['config', 'tests/fixtures/four-plans', 'tests/fixtures/history']) {
            await fs.cp(path.join(project, directory), path.join(isolated, directory), { recursive: true });
        }
        for (const name of ['quiz-engine.js', 'src/engine-core.mjs', 'scripts/config-release.mjs', 'scripts/evaluate-reference.mjs',
            'tests/fixtures/reference-scenarios.js', 'tests/fixtures/reference-profiles.js']) {
            await fs.mkdir(path.dirname(path.join(isolated, name)), { recursive: true });
            await fs.copyFile(path.join(project, name), path.join(isolated, name));
        }
        await fs.symlink(path.join(project, 'node_modules'), path.join(isolated, 'node_modules'), 'dir');
        const run = async (...args) => JSON.parse((await exec(process.execPath, ['scripts/config-release.mjs', ...args], { cwd: isolated })).stdout);
        const args = ['prepare', '--diagnostic', '--directory', path.join(isolated, 'snapshots'), '--date', '2026-10-28'];
        const first = await run(...args);
        const unchanged = await run(...args);
        assert.deepEqual(unchanged.metadata, first.metadata, 'preparo repetido é idempotente');
        assert.equal(first.releaseApproved, false, 'nenhum aceite de regressão é inventado');
        const originalCatalog = JSON.parse(await fs.readFile(path.join(isolated, 'config/planos/catalogo.json'), 'utf8'));
        const modified = structuredClone(originalCatalog);
        modified[0].nome += ' — revisão local';
        await fs.writeFile(path.join(isolated, 'config/planos/catalogo.json'), JSON.stringify(modified));
        const second = await run(...args);
        assert.notEqual(second.metadata.hashes.aggregate, first.metadata.hashes.aggregate);
        assert.notEqual(second.metadata.catalogVersion, first.metadata.catalogVersion);
        assert.notEqual(second.metadata.rulesVersion, first.metadata.rulesVersion);
        assert.equal(second.metadata.ga4Version, first.metadata.ga4Version);
        const backupFiles = await fs.readdir(path.join(isolated, 'snapshots/backups'));
        assert.ok(backupFiles.includes(first.metadata.hashes.aggregate + '.json'));
        const restored = await run('restore', '--directory', path.join(isolated, 'snapshots'), '--hash', first.metadata.hashes.aggregate);
        assert.deepEqual(restored.restored, first.metadata);
        assert.deepEqual(JSON.parse(await fs.readFile(path.join(isolated, 'config/planos/catalogo.json'), 'utf8')), originalCatalog);
        const metadataBeforeFailure = await fs.readFile(path.join(isolated, 'config/revision.json'), 'utf8');
        const pointerBeforeFailure = await fs.readFile(path.join(isolated, 'snapshots/current.json'), 'utf8');
        modified[0].contratacao.precoMensalEquivalente = -1;
        await fs.writeFile(path.join(isolated, 'config/planos/catalogo.json'), JSON.stringify(modified));
        await assert.rejects(run(...args), /Configuração inválida|Configura/);
        assert.equal(await fs.readFile(path.join(isolated, 'config/revision.json'), 'utf8'), metadataBeforeFailure);
        assert.equal(await fs.readFile(path.join(isolated, 'snapshots/current.json'), 'utf8'), pointerBeforeFailure);
        // Restore also recovers a locally edited, invalid operational candidate.
        await run('restore', '--directory', path.join(isolated, 'snapshots'), '--hash', first.metadata.hashes.aggregate);
        assert.deepEqual(JSON.parse(await fs.readFile(path.join(isolated, 'config/planos/catalogo.json'), 'utf8')), originalCatalog);
    } finally { await fs.rm(isolated, { recursive: true, force: true }); }
});
