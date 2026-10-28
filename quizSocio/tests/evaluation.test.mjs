import test from 'node:test';
import assert from 'node:assert/strict';
import engine from '../quiz-engine.js';
import reference from './fixtures/four-plans/profiles.json' with { type: 'json' };
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

test('regressão histórica preserva RES-11 e separa resultados das novas partições', async () => {
    const historical = await evaluateReference();
    assert.equal(historical.rows.find((row) => row.id === 'RES-11').top1, false);
    assert.deepEqual(historical.rows.find((row) => row.id === 'RES-11').acceptable, ['time-do-povo']);
    const validation = await evaluateReference({ reference: 'profiles', split: 'validacao' });
    assert.deepEqual(Object.keys(validation.groups), ['validacao']);
    assert.equal(validation.rows.length, 8);
    await assert.rejects(evaluateReference({ reference: 'profiles', split: 'reserva' }), /Partição inexistente/);
});


test('piso estatístico não aprova perdas de acerto da migração automaticamente', async () => {
    for (const reference of ['historical', 'profiles']) {
        const report = await evaluateReference({ reference });
        assert.equal(report.passed, true, JSON.stringify(report.groups));
        assert.equal(report.reviewRequired, true);
        assert.ok(report.regressions.length > 0);
        assert.equal(report.releaseApproved, false);
        assert.ok(report.rows.some((row) => row.winnerChanged));
    }
});
