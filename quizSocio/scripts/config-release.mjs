import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { carregarTodaConfiguracao, validateConfiguration } from '../config/adapter.js';
import { createEngine } from '../src/engine-core.mjs';

export const projectRoot = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const metadataPath = path.join(projectRoot, 'config/revision.json');
const domainFiles = Object.freeze({
    catalogo: 'config/planos/catalogo.json', questoes: 'config/questoes/questoes.json',
    pesosRanking: 'config/pesos/ranking.json', pesosPerfil: 'config/pesos/perfil.json', ga4: 'config/ga4/ga4.json'
});
const schemaFiles = Object.freeze({
    catalog: 'config/planos/catalogo.schema.json', questions: 'config/questoes/questoes.schema.json',
    weights: 'config/pesos/pesos.schema.json', ga4: 'config/ga4/ga4.schema.json'
});

/** Canonical content identity: object keys sorted; array order and scalar types preserved. */
export function canonicalize(value) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
    if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
    if (value && typeof value === 'object') {
        return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + canonicalize(value[key])).join(',') + '}';
    }
    throw new Error('Identidade aceita somente valores JSON finitos.');
}
export const sha256 = (value) => createHash('sha256').update(typeof value === 'string' ? value : canonicalize(value)).digest('hex');
const readJSON = (name) => JSON.parse(fs.readFileSync(name, 'utf8'));
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
function incrementVersion(previous, date) {
    const prefix = date + '.';
    return prefix + (previous?.startsWith(prefix) ? Number(previous.slice(prefix.length)) + 1 : 1);
}

export function inspectConfiguration({ configuration, date = today() } = {}) {
    const config = configuration ? structuredClone(configuration) : carregarTodaConfiguracao();
    config.metadata = configuration?.metadata ?? readJSON(metadataPath);
    validateConfiguration(config);
    const schemaHashes = Object.fromEntries(Object.entries(schemaFiles).map(([key, name]) => [key, sha256(readJSON(path.join(projectRoot, name)))]));
    const hashes = {
        catalog: sha256(config.catalogo), questions: sha256(config.questoes),
        ranking: sha256(config.pesosRanking), profile: sha256(config.pesosPerfil), ga4: sha256(config.ga4),
        engine: sha256(fs.readFileSync(path.join(projectRoot, 'src/engine-core.mjs'), 'utf8')),
        schemas: sha256(schemaHashes)
    };
    hashes.rules = sha256({ catalog: hashes.catalog, questions: hashes.questions, ranking: hashes.ranking,
        profile: hashes.profile, engine: hashes.engine });
    hashes.aggregate = sha256(hashes);
    const previous = config.metadata;
    const changed = (key) => previous.hashes?.[key] !== hashes[key];
    const versions = {
        catalogVersion: changed('catalog') ? incrementVersion(previous.catalogVersion, date) : previous.catalogVersion,
        rulesVersion: changed('rules') ? incrementVersion(previous.rulesVersion, date) : previous.rulesVersion,
        ga4Version: changed('ga4') ? incrementVersion(previous.ga4Version, date) : previous.ga4Version
    };
    return { configuration: config, hashes, schemaHashes, versions, pendingChanges: previous.hashes?.aggregate !== hashes.aggregate };
}

/** Bind the package to the actual application inputs, not merely to ranking configuration. */
export function inspectBuildInputs() {
    const files = ['index.html', 'vite.config.mjs', 'package.json', 'package-lock.json', 'config/adapter.js',
        'scripts/config-release.mjs', 'scripts/release-vite-plugin.mjs',
        'config/validadores-ajv.js', 'config/validadores-compilados.mjs', 'scripts/gerar-validadores.mjs'];
    function collect(directory) {
        for (const entry of fs.readdirSync(path.join(projectRoot, directory), { withFileTypes: true })) {
            const name = path.join(directory, entry.name);
            if (entry.isSymbolicLink()) throw new Error('Entrada simbólica não permitida no build: ' + name);
            if (entry.isDirectory()) collect(name);
            else if (entry.isFile()) files.push(name);
        }
    }
    collect('src');
    collect('img');
    return sha256(Object.fromEntries(files.sort().map((name) => [name, createHash('sha256').update(fs.readFileSync(path.join(projectRoot, name))).digest('hex')])));
}

/** Review is separate from statistical floors; a passing rate never authorizes a regression. */
export async function inspectQuality({ configuration, hashes, approvalPath = path.join(projectRoot, 'config/quality-approval.json') }) {
    const { evaluateReference } = await import('./evaluate-reference.mjs');
    const motor = createEngine(configuration);
    const historical = await evaluateReference({ reference: 'historical', motor, configurationHash: hashes.aggregate });
    const profiles = await evaluateReference({ reference: 'profiles', motor, configurationHash: hashes.aggregate });
    const regressions = [...historical.regressions, ...profiles.regressions].sort();
    const referenceHashes = { historical: historical.referenceSha256, profiles: profiles.referenceSha256 };
    let accepted = false;
    if (fs.existsSync(approvalPath)) {
        const approval = readJSON(approvalPath);
        accepted = approval.approved === true && typeof approval.approvedBy === 'string' && approval.approvedBy.trim().length > 0
            && typeof approval.approvedAt === 'string' && Number.isFinite(Date.parse(approval.approvedAt))
            && approval.configurationHash === hashes.aggregate
            && canonicalize(approval.referenceHashes) === canonicalize(referenceHashes)
            && canonicalize([...(approval.acceptedRegressionIds ?? [])].sort()) === canonicalize(regressions);
    }
    const metricsPassed = historical.passed && profiles.passed;
    return { metricsPassed, reviewRequired: regressions.length > 0, regressionIds: regressions,
        reviewAccepted: accepted, releaseApproved: metricsPassed && (!regressions.length || accepted),
        configurationHash: hashes.aggregate, referenceHashes, reports: { historical, profiles } };
}

function atomicWrite(name, contents) {
    fs.mkdirSync(path.dirname(name), { recursive: true });
    const temporary = name + '.tmp-' + randomUUID();
    try { fs.writeFileSync(temporary, contents); fs.renameSync(temporary, name); }
    finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}
const serialize = (value) => JSON.stringify(value, null, 2) + '\n';
function assertExternalStore(directory) {
    const resolved = path.resolve(directory);
    const forbidden = [path.join(projectRoot, 'dist'), path.join(projectRoot, 'public'), path.join(projectRoot, 'config')];
    if (resolved === projectRoot || forbidden.some((base) => resolved === base || resolved.startsWith(base + path.sep))) {
        throw new Error('Snapshots precisam ficar fora da saída pública e da configuração operacional.');
    }
    return resolved;
}

export async function prepareConfiguration({ directory = path.join(projectRoot, '.scratch/port-vue/config-candidates'), diagnostic = false,
    date = today(), beforeCommit } = {}) {
    const store = assertExternalStore(directory);
    const inspection = inspectConfiguration({ date });
    const metadata = { ...inspection.versions, hashes: inspection.hashes };
    const configuration = { ...inspection.configuration, metadata };
    const quality = await inspectQuality({ configuration, hashes: inspection.hashes });
    if (!quality.releaseApproved && !diagnostic) throw new Error('Entrega bloqueada: regressões precisam de aceite explícito ou métricas estão abaixo do piso. Use --diagnostic somente para candidato local não aprovado.');
    fs.mkdirSync(store, { recursive: true });
    const snapshotPath = path.join(store, 'revisions', inspection.hashes.aggregate + '.json');
    const snapshot = { format: 1, metadata, configuration, schemaHashes: inspection.schemaHashes,
        quality, scope: quality.releaseApproved ? 'candidato local; entrega é ação separada' : 'diagnóstico local; entrega bloqueada' };
    if (!fs.existsSync(snapshotPath)) atomicWrite(snapshotPath, serialize(snapshot));
    const pointer = path.join(store, 'current.json');
    if (fs.existsSync(pointer)) {
        const previous = readJSON(pointer);
        const currentContent = readJSON(metadataPath);
        atomicWrite(path.join(store, 'backups', previous.hash + '.json'), serialize({ ...previous, metadata: currentContent }));
    }
    // All validation and quality evaluation precede the only operational write.
    await beforeCommit?.();
    const previousMetadata = fs.readFileSync(metadataPath, 'utf8');
    try {
        atomicWrite(metadataPath, serialize(metadata));
        atomicWrite(pointer, serialize({ hash: inspection.hashes.aggregate, snapshot: path.relative(store, snapshotPath) }));
    } catch (error) { atomicWrite(metadataPath, previousMetadata); throw error; }
    return { ...inspection, metadata, snapshotPath, quality };
}

export function restoreConfiguration({ directory = path.join(projectRoot, '.scratch/port-vue/config-candidates'), hash } = {}) {
    if (!/^[a-f0-9]{64}$/.test(hash ?? '')) throw new Error('Informe o SHA-256 completo da revisão a restaurar.');
    const store = assertExternalStore(directory);
    const snapshot = readJSON(path.join(store, 'revisions', hash + '.json'));
    const inspection = inspectConfiguration({ configuration: snapshot.configuration });
    if (inspection.hashes.aggregate !== hash || snapshot.metadata.hashes.aggregate !== hash) {
        throw new Error('Snapshot incompatível: lógica, schemas ou conteúdo diferem da revisão registrada.');
    }
    const replacements = Object.entries(domainFiles).map(([key, filename]) => [path.join(projectRoot, filename), serialize(snapshot.configuration[key])]);
    replacements.push([metadataPath, serialize(snapshot.metadata)]);
    const previous = replacements.map(([name]) => [name, fs.readFileSync(name, 'utf8')]);
    const previousMetadata = readJSON(metadataPath);
    atomicWrite(path.join(store, 'backups', previousMetadata.hashes.aggregate + '.json'), serialize({ configurationFiles: Object.fromEntries(Object.values(domainFiles).map((name) => [name, fs.readFileSync(path.join(projectRoot, name), 'utf8')])), metadata: previousMetadata }));
    try {
        for (const [name, contents] of replacements) atomicWrite(name, contents);
        atomicWrite(path.join(store, 'current.json'), serialize({ hash, snapshot: 'revisions/' + hash + '.json' }));
    } catch (error) { for (const [name, contents] of previous) atomicWrite(name, contents); throw error; }
    return snapshot;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const args = process.argv.slice(2); const operation = args.shift(); const options = {};
        while (args.length) {
            const flag = args.shift();
            if (flag === '--diagnostic') { options.diagnostic = true; continue; }
            if (!['--directory', '--hash', '--date'].includes(flag)) throw new Error('Argumento desconhecido: ' + flag);
            const value = args.shift(); if (!value || value.startsWith('--')) throw new Error('Valor ausente: ' + flag);
            options[flag.slice(2)] = value;
        }
        if (operation === 'prepare') {
            const result = await prepareConfiguration(options);
            console.log(JSON.stringify({ metadata: result.metadata, snapshot: result.snapshotPath, releaseApproved: result.quality.releaseApproved, regressions: result.quality.regressionIds }, null, 2));
        } else if (operation === 'restore') {
            const result = restoreConfiguration(options); console.log(JSON.stringify({ restored: result.metadata, scope: 'configuração local; sem deploy' }, null, 2));
        } else throw new Error('Uso: node scripts/config-release.mjs prepare [--diagnostic] | restore --hash SHA256');
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}
