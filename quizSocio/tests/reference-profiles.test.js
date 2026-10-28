const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const engine = require('../quiz-engine.js');
const original = require('./fixtures/reference-profiles.js');
const reference = require('./fixtures/four-plans/profiles.json');
const derivedProvenance = require('./fixtures/four-plans/provenance.json');
const provenance = require('./fixtures/reference-profiles-provenance.json');

test('referência de perfis possui respostas completas, partições disjuntas e sem contradições', () => {
    assert.equal(reference.profiles.length, 8);
    assert.equal(reference.scenarios.length, 16);
    assert.equal(new Set(reference.scenarios.map((item) => item.id)).size, 16);
    const keys = engine.questions.map((question) => question.key).sort();
    for (const profile of reference.profiles) {
        const cases = reference.scenarios.filter((item) => item.profileId === profile.id);
        assert.deepEqual(cases.map((item) => item.split).sort(), ['calibracao', 'validacao']);
        assert.notDeepEqual(cases[0].answers, cases[1].answers, profile.id);
    }
    for (const scenario of reference.scenarios) {
        assert.deepEqual(Object.keys(scenario.answers).sort(), keys, scenario.id);
        assert.deepEqual(engine.validateAnswers(scenario.answers), [], scenario.id);
        assert.deepEqual(engine.detectConflicts(scenario.answers), [], scenario.id);
    }
});

test('expectativas dos perfis cobrem os planos e respeitam o teto da assinatura', () => {
    const covered = new Set();
    for (const scenario of reference.scenarios) {
        assert.ok(scenario.reason.length > 50, scenario.id);
        assert.ok(scenario.acceptable.length > 0, scenario.id);
        for (const slug of scenario.acceptable) {
            const plan = engine.plans.find((item) => item.slug === slug);
            assert.ok(plan, slug);
            assert.ok(plan.contratacao.precoMensalEquivalente <= scenario.answers.budget, scenario.id);
            covered.add(slug);
        }
    }
    assert.deepEqual([...covered].sort(), engine.plans.map((plan) => plan.slug).sort());
});

test('transformação do engine preserva as necessidades descritas em cada perfil', () => {
    for (const scenario of reference.scenarios) {
        const profile = engine.buildUserProfile(scenario.answers);
        const expected = scenario.expectedNeeds;
        assert.equal(profile.adultos, expected.adults, scenario.id);
        assert.equal(profile.kids, expected.kids, scenario.id);
        if (expected.attendance === 'none') assert.equal(profile.frecuencia, 0, scenario.id);
        else assert.ok(profile.frecuencia > 0, scenario.id);
        for (const key of ['frecuencia', 'prioridad', 'experiencias', 'descuentos', 'productos', 'importanciaPreco']) {
            assert.ok(Number.isFinite(profile[key]) && profile[key] >= 0 && profile[key] <= 10, `${scenario.id}: ${key}`);
        }
    }
});

test('referência sintética fica congelada e declara autoria e limites de validação', () => {
    const digest = createHash('sha256').update(JSON.stringify(original)).digest('hex');
    assert.equal(digest, provenance.sha256);
    assert.equal(provenance.kind, 'agent-authored-synthetic-reference');
    assert.equal(provenance.independentValidation, false);
    assert.equal(provenance.rankingEvaluationTicket, 'QUIZ-010-A');
});


test('revisão de quatro planos preserva os dados da referência binária e remove apenas o slug', () => {
    const digest = createHash('sha256').update(JSON.stringify(reference)).digest('hex');
    assert.equal(digest, derivedProvenance.references.profiles.derivedSha256);
    assert.equal(derivedProvenance.independentValidation, false);
    assert.equal(reference.scenarios.length, original.scenarios.length);
    for (const [index, scenario] of reference.scenarios.entries()) {
        const previous = original.scenarios[index];
        assert.deepEqual(scenario.answers, previous.answers);
        assert.equal(scenario.reason, previous.reason);
        assert.deepEqual(scenario.acceptable, previous.acceptable.filter((slug) => slug !== 'cabuloso-cativo'));
    }
});

test('migração binária preserva histórico, partições e expectativas de planos', () => {
    const previousProvenance = require('./fixtures/history/before-binary-kids/provenance.json');
    for (const kind of ['historical', 'profiles']) {
        const previous = require(`./fixtures/history/before-binary-kids/${kind}.json`);
        const previousSource = require(`./fixtures/history/before-binary-kids/reference-${kind === 'historical' ? 'scenarios' : 'profiles'}.cjs`);
        const current = require(`./fixtures/four-plans/${kind}.json`);
        const digest = (data) => createHash('sha256').update(JSON.stringify(data)).digest('hex');
        assert.equal(digest(previous), previousProvenance.references[kind].derivedSha256);
        assert.equal(digest(previousSource), previousProvenance.references[kind].sourceSha256);
        assert.equal(current.scenarios.length, previous.scenarios.length);
        for (const [index, scenario] of current.scenarios.entries()) {
            const before = previous.scenarios[index];
            assert.equal(scenario.id, before.id);
            assert.equal(scenario.split, before.split);
            assert.deepEqual(scenario.acceptable, before.acceptable, scenario.id);
            assert.deepEqual(scenario.answers, { ...before.answers, kidsCount: before.answers.kidsCount > 0 ? 1 : 0 }, scenario.id);
        }
    }
});
