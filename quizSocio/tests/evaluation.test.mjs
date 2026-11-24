import test from 'node:test';
import assert from 'node:assert/strict';
import engine from '../quiz-engine.js';
import reference from './fixtures/four-plans/profiles.json' with { type: 'json' };
import historicalReference from './fixtures/four-plans/historical.json' with { type: 'json' };
import { evaluateReference, evaluateScenarios } from '../scripts/evaluate-reference.mjs';

test('referência congelada de perfis atende às metas em calibração e validação', async () => {
    const report = await evaluateReference({ reference: 'profiles' });
    assert.equal(report.rulesVersion, engine.RULES_VERSION);
    assert.equal(report.catalogVersion, engine.CATALOG_VERSION);
    assert.equal(report.independentValidation, false);
    assert.match(report.referenceSha256, /^[a-f0-9]{64}$/);
    assert.match(report.engineSha256, /^[a-f0-9]{64}$/);
    assert.equal(report.groups.calibracao.total, 8);
    assert.equal(report.groups.validacao.total, 8);
    assert.equal(report.passed, true, JSON.stringify(report.groups));
});

test('avaliação registra falha de expectativa e recusa conjunto vazio ou inválido', () => {
    const scenario = reference.scenarios[0];
    const expected = ['time-do-povo'];
    const report = evaluateScenarios([{ ...scenario, acceptable: expected }]);
    assert.equal(report.passed, false);
    assert.equal(report.rows[0].top1, false);
    assert.equal(report.rows[0].top3, true);
    assert.deepEqual(expected, ['time-do-povo'], 'o avaliador não muda as expectativas para aprovar');
    assert.throws(() => evaluateScenarios([]), /pelo menos um cenário/);
    assert.throws(() => evaluateScenarios([{ ...scenario, answers: {} }]), /respostas inválidas/);
});

test('regra sem preço corrige RES-11 sem alterar sua expectativa e separa partições', async () => {
    const historical = await evaluateReference();
    assert.equal(historical.rows.find((row) => row.id === 'RES-11').top1, true);
    assert.deepEqual(historical.rows.find((row) => row.id === 'RES-11').acceptable, ['time-do-povo']);
    const validation = await evaluateReference({ reference: 'profiles', split: 'validacao' });
    assert.deepEqual(Object.keys(validation.groups), ['validacao']);
    assert.equal(validation.rows.length, 8);
    await assert.rejects(evaluateReference({ reference: 'profiles', split: 'reserva' }), /Partição inexistente/);
});


test('nova regra atende a todas as expectativas congeladas sem aceite de perdas', async () => {
    for (const reference of ['historical', 'profiles']) {
        const report = await evaluateReference({ reference });
        assert.ok(report.rows.every((row) => row.top1), JSON.stringify(report.rows.filter((row) => !row.top1)));
        assert.equal(report.reviewRequired, false);
        assert.deepEqual(report.regressions, []);
        assert.equal(report.releaseApproved, true);
    }
});

test('piso estatístico não aprova novas perdas de acerto automaticamente', () => {
    for (const data of [historicalReference, reference]) {
        const scenarios = data.scenarios.filter((s) => s.split !== 'contradicao');
        const target = scenarios[0];
        const regressed = {
            ...engine,
            recommendPlans(answers) {
                const result = engine.recommendPlans(answers);
                if (answers !== target.answers) return result;
                const wrong = result.eligible.find((p) => !target.acceptable.includes(p.plan.slug));
                const eligible = [wrong, ...result.eligible.filter((p) => p !== wrong)];
                return { ...result, eligible, winner: wrong };
            }
        };
        const report = evaluateScenarios(scenarios, { motor: regressed, baseline: engine });
        assert.equal(report.passed, true, JSON.stringify(report.groups));
        assert.equal(report.reviewRequired, true);
        assert.deepEqual(report.regressions, [target.id]);
        assert.equal(report.releaseApproved, false);
        assert.ok(report.rows.some((row) => row.winnerChanged));
    }
});
