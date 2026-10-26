const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const engine = require('../quiz-engine.js');
const { premissas, scenarios } = require('./fixtures/reference-scenarios.js');
const { toOldAnswers } = require('./baseline.js');

const reserved = scenarios.filter((scenario) => scenario.split === 'reserva');
const calibration = scenarios.filter((scenario) => scenario.split === 'calibracao');
const contradictions = scenarios.filter((scenario) => scenario.split === 'contradicao');
const valid = [...calibration, ...reserved];

function metrics(list) {
    const rows = list.map((scenario) => {
        const result = engine.recommendPlans(scenario.answers);
        const ranking = result.eligible.map((item) => item.plan.slug);
        const top1 = scenario.acceptable.includes(ranking[0]);
        const top3 = ranking.slice(0, 3).some((slug) => scenario.acceptable.includes(slug));
        const violations = result.eligible.some((item) => !item.eligibility.withinBudget)
            || (result.winner !== null && result.winner.cost.subscription > scenario.answers.budget);
        return { scenario, result, ranking, top1, top3, violations };
    });

    return {
        rows,
        top1: rows.filter((row) => row.top1).length,
        top3: rows.filter((row) => row.top3).length,
        violations: rows.filter((row) => row.violations).length,
        total: rows.length
    };
}

test('a referência reservada atinge as metas registradas no QUIZ-009', () => {
    const result = metrics(reserved);
    const top1Rate = result.top1 / result.total;
    const top3Rate = result.top3 / result.total;

    assert.equal(result.violations, 0, 'nenhuma restrição obrigatória pode ser violada');
    assert.ok(top1Rate >= 0.80, `top-1 ${result.top1}/${result.total} abaixo de 80%`);
    assert.ok(top3Rate >= 0.95, `top-3 ${result.top3}/${result.total} abaixo de 95%`);

    result.rows.forEach((row) => {
        assert.ok(Number.isFinite(row.result.winner.score), `${row.scenario.id} sem score finito`);
        assert.ok(row.result.winner.score >= 0 && row.result.winner.score <= 100);
    });
});

test('a base de calibração também é consistente', () => {
    const result = metrics(calibration);
    assert.equal(result.violations, 0);
    assert.ok(result.top1 / result.total >= 0.90);
});

test('a partição é disjunta e os cenários válidos não contêm contradições', () => {
    const ids = scenarios.map((scenario) => scenario.id);
    assert.equal(new Set(ids).size, ids.length, 'ids duplicados');
    scenarios.forEach((scenario) => {
        assert.ok(['calibracao', 'reserva', 'contradicao'].includes(scenario.split), `${scenario.id} sem partição`);
    });
    valid.forEach((scenario) => {
        assert.deepEqual(engine.validateAnswers(scenario.answers), [], `${scenario.id} tem resposta inválida`);
        assert.deepEqual(engine.detectConflicts(scenario.answers), [], `${scenario.id} é contraditório`);
        assert.ok(scenario.acceptable.length > 0, `${scenario.id} sem plano aceitável`);
    });
});

test('cenários contraditórios são detectados e ficam fora das métricas', () => {
    assert.ok(contradictions.length >= 4);
    contradictions.forEach((scenario) => {
        assert.deepEqual(engine.validateAnswers(scenario.answers), [], `${scenario.id} tem resposta inválida`);
        const found = engine.detectConflicts(scenario.answers).map((conflict) => conflict.keys);
        assert.deepEqual(found, scenario.expectedConflicts, `${scenario.id} com conflitos inesperados`);
        assert.equal(scenario.acceptable.length, 0, `${scenario.id} não deve ter vencedor esperado sem confirmação`);
    });
});

test('premissas de preço da referência são as mesmas do motor', () => {
    Object.keys(premissas).forEach((key) => {
        assert.equal(premissas[key], engine.ASSUMPTIONS[key], `premissa ${key} divergente`);
    });
});

test('cada plano tem cenário em que é aceitável', () => {
    const accepted = new Set();
    scenarios.forEach((scenario) => scenario.acceptable.forEach((slug) => accepted.add(slug)));
    engine.plans.forEach((plan) => {
        assert.ok(accepted.has(plan.slug), `${plan.slug} não aparece como aceitável em nenhum cenário`);
    });
});

test('cenários ambíguos aceitam mais de um plano e não exigem vencedor fixo', () => {
    const ambiguous = scenarios.filter((scenario) => scenario.acceptable.length > 1);
    assert.ok(ambiguous.length >= 6);
    ambiguous.forEach((scenario) => {
        assert.ok(scenario.reason.length > 30);
    });
});

test('mudar apenas o histórico cruza o nível e altera o benefício atual', () => {
    const answers = {
        ...scenarios.find((scenario) => scenario.id === 'RES-09').answers
    };
    const level2 = engine.recommendPlans({ ...answers, gamesHistory: 10 });
    const level3 = engine.recommendPlans({ ...answers, gamesHistory: 20 });
    const cabuloso2 = level2.all.find((item) => item.plan.slug === 'cabuloso');
    const cabuloso3 = level3.all.find((item) => item.plan.slug === 'cabuloso');

    assert.equal(cabuloso2.ticket.nivel.nivel, 2);
    assert.equal(cabuloso3.ticket.nivel.nivel, 3);
    assert.equal(cabuloso2.ticket.desconto, 0.55);
    assert.equal(cabuloso3.ticket.desconto, 0.60);
    assert.notEqual(cabuloso2.score, cabuloso3.score);
});

test('mudar apenas a intenção futura não concede nível superior', () => {
    const answers = {
        ...scenarios.find((scenario) => scenario.id === 'CAL-08').answers
    };
    const lowIntention = engine.recommendPlans({ ...answers, gamesPerYear: 2, gamesHistory: 5 });
    const highIntention = engine.recommendPlans({ ...answers, gamesPerYear: 30, gamesHistory: 5 });
    const low = lowIntention.all.find((item) => item.plan.slug === 'cabuloso');
    const high = highIntention.all.find((item) => item.plan.slug === 'cabuloso');

    assert.equal(low.ticket.nivel.nivel, 1);
    assert.equal(high.ticket.nivel.nivel, 1);
    assert.equal(low.ticket.desconto, high.ticket.desconto);
});

test('comparação com a linha de base registra as mudanças intencionais', () => {
    const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'baseline-results.json'), 'utf8'));
    assert.equal(baseline.commit, '2cecf81');
    assert.equal(baseline.cases.length, 5);

    baseline.cases.forEach((item) => {
        const scenario = scenarios.find((candidate) => candidate.id === item.mappedScenario);
        assert.ok(scenario, `${item.mappedScenario} não existe`);
        const result = engine.recommendPlans(scenario.answers);
        assert.ok(result.winner, `${item.id} sem vencedor`);
        assert.ok(item.baselineRanking[0].score > 0);
    });

    const purple = baseline.cases.find((item) => item.id === 'roxo-familia');
    const mapped = scenarios.find((candidate) => candidate.id === purple.mappedScenario);
    const newWinner = engine.recommendPlans(mapped.answers).winner.plan.slug;
    assert.equal(newWinner, 'cabuloso-max', 'a correção de setor deve tirar o Cativo do Roxo');
});

test('linha de base do ranking anterior cobre toda a referência, por segmento', (t) => {
    const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'baseline-reference.json'), 'utf8'));
    assert.equal(baseline.commit, '2cecf81');
    assert.deepEqual(
        baseline.cases.map((item) => item.id),
        scenarios.map((scenario) => scenario.id),
        'referência mudou: rode `npm run baseline`'
    );

    const current = new Map(metrics(valid).rows.map((row) => [row.scenario.id, row]));
    const segments = {};
    baseline.cases.filter((item) => item.split !== 'contradicao').forEach((item) => {
        const scenario = scenarios.find((candidate) => candidate.id === item.id);
        assert.deepEqual(item.oldAnswers, toOldAnswers(scenario.answers), `${item.id} desatualizado`);
        const key = `${item.split} · ${item.category}`;
        const row = current.get(item.id);
        segments[key] = `antes ${item.top1 ? 'ok' : 'falha'} (${item.ranking[0].plan}) → agora ${row.top1 ? 'ok' : 'falha'} (${row.ranking[0]})`;
    });
    Object.entries(segments).forEach(([key, value]) => t.diagnostic(`${key}: ${value}`));

    const reservedBaseline = baseline.cases.filter((item) => item.split === 'reserva');
    const reservedNow = metrics(reserved);
    t.diagnostic(`reserva top-1: antes ${reservedBaseline.filter((item) => item.top1).length}/${reservedBaseline.length}, agora ${reservedNow.top1}/${reservedNow.total}`);
    assert.ok(reservedNow.top1 >= reservedBaseline.filter((item) => item.top1).length, 'o ranking atual não pode piorar a linha de base na reserva');
});
