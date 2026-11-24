import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, readdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { inspectPage, verifyExternal } from '../scripts/verify-external.mjs';
import { prepareRelease } from '../scripts/prepare-release.mjs';
import engine from '../quiz-engine.js';
import { createHash } from 'node:crypto';
import { verifyPublishedBuild } from '../scripts/verify-published-build.mjs';

test('catálogo atende à referência documental oficial sem alegar validação independente do ranking', async () => {
    const reference = JSON.parse(await readFile(new URL('./fixtures/official-commercial-reference.json', import.meta.url), 'utf8'));
    assert.equal(reference.independentRankingValidation, false);
    for (const expected of reference.plans.filter((plan) => plan.slug !== 'cabuloso-cativo')) {
        const plan = engine.plans.find((item) => item.slug === expected.slug);
        assert.ok(plan, expected.slug);
        assert.equal(engine.getPlanPricing(plan).subscription, expected.subscriptionEquivalent, expected.slug);
        assert.equal(plan.contratacao.taxaAdesao, expected.adhesion, expected.slug);
        assert.equal(plan.ingresso.tipo, expected.ticketType, expected.slug);
        assert.equal(plan.ingresso.quantidade, expected.ticketQuantity, expected.slug);
        assert.ok(plan.contratacao.modalidades.every((mode) => expected.publishedModalities.includes(mode)), expected.slug);
        assert.equal(plan.opcionais.kids.precoMensal, reference.kids.monthlyUnitPrice);
        assert.equal(plan.opcionais.kids.maxCriancas, reference.kids.maxChildren);
        assert.equal(plan.opcionais.kids.idadeMaxima, reference.kids.ageExclusiveUpperBound);
    }
    assert.equal(engine.plans.some((plan) => plan.slug === 'cabuloso-cativo'), false);
    assert.equal(engine.plans.length, 4);
    assert.equal(engine.plans.find((plan) => plan.slug === 'cabuloso-max').ingresso.descontoFixo, reference.maxDiscount);
    const cabuloso = engine.plans.find((plan) => plan.slug === 'cabuloso');
    for (const expected of reference.cabulosoLevels) {
        const benefit = engine.getTicketBenefit(cabuloso, { gamesHistory: expected.games });
        assert.equal(benefit.desconto, expected.discount);
        assert.equal(engine.getPriority(cabuloso, { gamesHistory: expected.games }).value, expected.priority);
    }
});

test('HTTP 200 e uma tag presente não comprovam oferta nem recebimento GA4', async () => {
    const requests = [];
    const fetchImpl = async (url, options) => {
        requests.push({ url, options });
        return new Response('<title>Página disponível</title>G-EF75QCTCTV', { status: 200 });
    };
    const report = await verifyExternal({ fetchImpl });
    assert.equal(requests.length, 5);
    assert.ok(requests.every((request) => request.options.method === 'GET'));
    assert.equal(report.published.matchesLocalSource, false);
    assert.equal(report.ga4IngestionConfirmed, false);
    assert.equal(report.crossDomainIdentityConfirmed, false);
    assert.ok(report.checkouts.every((checkout) => checkout.status === 200 && !checkout.offerConfirmed));
});

test('desafio 403 e falha de rede são registrados sem inventar confirmação', async () => {
    const blocked = await inspectPage('https://example.test/', {
        fetchImpl: async () => new Response('<title>Just a moment...</title>challenge-platform', { status: 403 })
    });
    assert.equal(blocked.status, 403);
    assert.equal(blocked.challenge, true);
    const unavailable = await inspectPage('https://example.test/', {
        fetchImpl: async () => { throw new Error('sem conexão'); }
    });
    assert.equal(unavailable.status, null);
    assert.equal(unavailable.error, 'sem conexão');
});

test('candidato de entrega contém somente arquivos públicos e recusa sobrescrita', async () => {
    const output = await mkdtemp(path.join(os.tmpdir(), 'quiz-release-test-'));
    try {
        const manifest = await prepareRelease(output, { diagnostic: true });
        assert.deepEqual((await readdir(output)).sort(), ['manifest.json', 'public']);
        assert.ok(manifest.files.some((file) => file.path === 'index.html'));
        assert.ok(manifest.files.some((file) => /^assets\/.*\.js$/.test(file.path)));
        assert.ok(manifest.files.some((file) => file.path === 'build-manifest.json'));
        assert.equal(manifest.diagnostic, true);
        assert.equal(manifest.releaseApproved, false);
        assert.ok(manifest.files.every((file) => ['index.html', 'build-manifest.json'].includes(file.path) || file.path.startsWith('assets/') || file.path.startsWith('img/')));
        assert.ok(manifest.files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256)));
        assert.deepEqual(JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8')), manifest);
        await assert.rejects(prepareRelease(output), /precisa estar vazio/);
        await assert.rejects(prepareRelease(path.resolve('release-test')), /fora do diretório/);
    } finally {
        await rm(output, { recursive: true, force: true });
    }
});


test('preparo de entrega sem perdas dispensa aceite de regressão', async () => {
    const output = await mkdtemp(path.join(os.tmpdir(), 'quiz-release-gated-'));
    try {
        const manifest = await prepareRelease(output);
        assert.equal(manifest.releaseApproved, true);
        assert.equal(manifest.diagnostic, false);
        assert.deepEqual(manifest.quality.regressionIds, []);
    }
    finally { await rm(output, { recursive: true, force: true }); }
});

test('servidor de teste respeita a raiz solicitada mesmo com dist existente', async () => {
    const { default: staticServer } = await import('./static-server.js');
    const directory = await mkdtemp(path.join(os.tmpdir(), 'quiz-explicit-server-'));
    let server;
    try {
        await writeFile(path.join(directory, 'index.html'), '<title>Raiz explícita de teste</title>');
        server = await staticServer.startServer(directory);
        const response = await fetch(server.baseUrl + '/index.html');
        assert.equal(response.status, 200);
        assert.equal(await response.text(), '<title>Raiz explícita de teste</title>');
    } finally {
        if (server) await server.close();
        await rm(directory, { recursive: true, force: true });
    }
});

async function compiledPackage() {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'quiz-published-build-'));
    const versions = { catalogVersion: 'test-catalog', rulesVersion: 'test-rules', ga4Version: 'test-ga4' };
    const hashes = { aggregate: 'test-configuration' };
    const sources = {
        'index.html': '<script type="module" src="/assets/app.js"></script>',
        'build-manifest.json': JSON.stringify({ versions, hashes }),
        'assets/app.js': 'console.log("compiled quiz");'
    };
    const manifest = { ...versions, configurationHashes: hashes, commit: 'test-commit', workingTreeHasChanges: false,
        releaseApproved: true, diagnostic: false, files: [] };
    for (const [name, content] of Object.entries(sources)) {
        await mkdir(path.dirname(path.join(directory, 'public', name)), { recursive: true });
        await writeFile(path.join(directory, 'public', name), content);
        manifest.files.push({ path: name, bytes: Buffer.byteLength(content), sha256: createHash('sha256').update(content).digest('hex') });
    }
    await writeFile(path.join(directory, 'manifest.json'), JSON.stringify(manifest));
    return { directory, sources, manifest };
}

test('publicação só coincide quando HTML, manifesto e bundle têm os hashes do pacote', async () => {
    const fixture = await compiledPackage();
    try {
        const fetchImpl = async (url) => new Response(fixture.sources[new URL(url).pathname.slice(1) || 'index.html']);
        const report = await verifyPublishedBuild({ packageDirectory: fixture.directory, publicUrl: 'https://quiz.example/', fetchImpl });
        assert.equal(report.matchesPreparedBuild, true);
        assert.deepEqual(report.publishedVersions, report.expectedVersions);
        assert.equal(report.files.length, 3);
        assert.equal(report.runtimeContractVerified, false);
        assert.equal(report.ga4IngestionConfirmed, false);
        fixture.sources['assets/app.js'] += ' /* bundle diferente */';
        const changed = await verifyPublishedBuild({ packageDirectory: fixture.directory, publicUrl: 'https://quiz.example/', fetchImpl });
        assert.equal(changed.matchesPreparedBuild, false);
        assert.equal(changed.files.find((file) => file.path === 'assets/app.js').matches, false);
    } finally { await rm(fixture.directory, { recursive: true, force: true }); }
});

test('legado e manifesto ausente não são aprovados por HTML 200 ou presença da tag', async () => {
    const fixture = await compiledPackage();
    try {
        const calls = [];
        const fetchImpl = async (url) => {
            calls.push(url);
            return new URL(url).pathname === '/'
                ? new Response('<script src="./quiz-engine.js"></script>G-EF75QCTCTV', { status: 200 })
                : new Response('Not found', { status: 404 });
        };
        const report = await verifyPublishedBuild({ packageDirectory: fixture.directory, publicUrl: 'https://quiz.example/', fetchImpl });
        assert.equal(report.matchesPreparedBuild, false);
        assert.equal(report.legacyScriptDetected, true);
        assert.equal(report.publishedVersions, null);
        assert.equal(calls.length, 2);
        assert.deepEqual(report.skippedFiles, ['assets/app.js']);
    } finally { await rm(fixture.directory, { recursive: true, force: true }); }
});

test('verificação recusa pacote local adulterado e caminhos fora da pasta pública antes da rede', async () => {
    const fixture = await compiledPackage();
    let calls = 0;
    const options = { packageDirectory: fixture.directory, fetchImpl: async () => { calls++; return new Response(''); } };
    try {
        await writeFile(path.join(fixture.directory, 'public/assets/app.js'), 'alterado');
        await assert.rejects(verifyPublishedBuild(options), /Pacote local alterado/);
        fixture.manifest.files[0].path = '../.env';
        await writeFile(path.join(fixture.directory, 'manifest.json'), JSON.stringify(fixture.manifest));
        await assert.rejects(verifyPublishedBuild(options), /Manifesto inválido/);
        assert.equal(calls, 0);
    } finally { await rm(fixture.directory, { recursive: true, force: true }); }
});
