import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import engine from '../quiz-engine.js';
import legacy from '../tests/fixtures/history/engine-five-plans.cjs';

const require = createRequire(import.meta.url);
const original = {
    historical: require('../tests/fixtures/reference-scenarios.js'),
    profiles: require('../tests/fixtures/reference-profiles.js')
};
const hash = (value) => createHash('sha256').update(value).digest('hex');
const thresholds = Object.freeze({ top1: 0.8, top3: 0.95, budgetViolations: 0 });

/** Evaluate frozen business expectations without changing answers, labels, or weights. */
export function evaluateScenarios(scenarios, { motor = engine, baseline = null } = {}) {
    if (!scenarios.length) throw new Error('A avaliação precisa de pelo menos um cenário.');
    const rows = scenarios.map((scenario) => {
        if (motor.validateAnswers(scenario.answers).length || motor.detectConflicts(scenario.answers).length) {
            throw new Error(`${scenario.id}: respostas inválidas ou contraditórias na avaliação de ranking.`);
        }
        if (!scenario.acceptable?.length) throw new Error(`${scenario.id}: planos aceitáveis ausentes.`);
        const result = motor.recommendPlans(scenario.answers);
        const ranked = result.eligible.map((item) => item.plan.slug);
        const old = baseline?.recommendPlans(scenario.answers);
        const previous = old && {
            winner: old.winner?.plan.slug ?? null,
            top1: scenario.acceptable.includes(old.winner?.plan.slug),
            scores: old.eligible.map((item) => ({ plan: item.plan.slug, score: item.score }))
        };
        return {
            id: scenario.id, split: scenario.split,
            profileId: scenario.profileId ?? null, category: scenario.category ?? scenario.profileId,
            acceptable: scenario.acceptable.slice(), reason: scenario.reason,
            ranking: ranked,
            scores: result.eligible.map((item) => ({ plan: item.plan.slug, score: item.score })),
            top1: scenario.acceptable.includes(ranked[0]),
            top3: ranked.slice(0, 3).some((slug) => scenario.acceptable.includes(slug)),
            budgetViolation: result.eligible.some((item) => item.pricing.subscription > scenario.answers.budget)
                || result.recommendations.some((item) => !item.eligibility.withinBudget),
            scoreViolation: result.all.some((item) => !Number.isFinite(item.score) || item.score < 0 || item.score > 100),
            ...(previous ? { previous, winnerChanged: previous.winner !== (result.winner?.plan.slug ?? null),
                accuracyRegression: previous.top1 && !scenario.acceptable.includes(ranked[0]) } : {})
        };
    });
    const groups = Object.fromEntries([...new Set(rows.map((row) => row.split))].map((split) => {
        const group = rows.filter((row) => row.split === split);
        const top1 = group.filter((row) => row.top1).length;
        const top3 = group.filter((row) => row.top3).length;
        const budgetViolations = group.filter((row) => row.budgetViolation).length;
        const scoreViolations = group.filter((row) => row.scoreViolation).length;
        return [split, {
            total: group.length, top1, top3, budgetViolations, scoreViolations,
            top1Rate: top1 / group.length, top3Rate: top3 / group.length,
            passed: top1 / group.length >= thresholds.top1 && top3 / group.length >= thresholds.top3
                && budgetViolations === 0 && scoreViolations === 0
        }];
    }));
    const regressions = rows.filter((row) => row.accuracyRegression).map((row) => row.id);
    const passed = Object.values(groups).every((group) => group.passed);
    return { thresholds: { ...thresholds }, groups, passed, reviewRequired: regressions.length > 0,
        regressions, releaseApproved: passed && regressions.length === 0, rows };
}

export async function evaluateReference({ reference = 'historical', split = null, motor = engine, configurationHash = null } = {}) {
    if (!['historical', 'profiles'].includes(reference)) throw new Error('Referência deve ser historical ou profiles.');
    const directory = new URL('../tests/fixtures/four-plans/', import.meta.url);
    const provenance = JSON.parse(await readFile(new URL('provenance.json', directory), 'utf8'));
    const data = JSON.parse(await readFile(new URL(`${reference}.json`, directory), 'utf8'));
    const originalHash = hash(JSON.stringify(original[reference]));
    const referenceSha256 = hash(JSON.stringify(data));
    const identity = provenance.references[reference];
    if (originalHash !== identity.sourceSha256 || referenceSha256 !== identity.derivedSha256) {
        throw new Error('Hash da referência diverge do congelamento histórico ou derivado.');
    }
    const valid = data.scenarios.filter((scenario) => scenario.split !== 'contradicao');
    if (split && !valid.some((scenario) => scenario.split === split)) throw new Error('Partição inexistente nessa referência.');
    const selected = split ? valid.filter((scenario) => scenario.split === split) : valid;
    const metadata = motor.getDefaultConfiguration?.().metadata;
    return {
        evaluatedAt: new Date().toISOString(), kind: 'derived-synthetic-reference',
        reference, referenceSha256, sourceReferenceSha256: originalHash, independentValidation: false,
        engineSha256: hash(await readFile(new URL('../src/engine-core.mjs', import.meta.url))),
        configurationHash: configurationHash ?? metadata?.hashes?.aggregate ?? null,
        rulesVersion: motor.RULES_VERSION, catalogVersion: motor.CATALOG_VERSION,
        sourceProposedByUser: 'https://socio.cruzeiro.com.br/planos',
        limitation: 'Referências sintéticas; métricas não representam avaliação externa, cega ou desempenho com usuários reais. Perdas de acerto requerem revisão explícita antes da entrega.',
        ...evaluateScenarios(selected, { motor, baseline: legacy })
    };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const args = process.argv.slice(2); const options = {};
        let output = null; let enforce = false;
        while (args.length) {
            const flag = args.shift();
            if (flag === '--enforce') { enforce = true; continue; }
            if (!['--reference', '--split', '--output'].includes(flag)) throw new Error(`Argumento desconhecido: ${flag}`);
            const value = args.shift();
            if (!value || value.startsWith('--')) throw new Error(`${flag} exige um valor.`);
            if (flag === '--output') output = value; else options[flag.slice(2)] = value;
        }
        const report = await evaluateReference(options);
        if (output) { await mkdir(path.dirname(path.resolve(output)), { recursive: true });
            await writeFile(output, JSON.stringify(report, null, 2) + '\n'); }
        console.log(JSON.stringify(report, null, 2));
        if (enforce && !report.releaseApproved) process.exitCode = 2;
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}
