import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { carregarTodaConfiguracao, validateConfiguration } from '../config/adapter.js';
import { createEngine } from '../src/engine-core.mjs';
const require = createRequire(import.meta.url);
const historical = require('./fixtures/history/engine-five-plans.cjs');
const current = require('../quiz-engine.js');
const references = require('./fixtures/reference-scenarios.js');
const complete = references.scenarios.find((s) => s.split !== 'contradicao').answers;
const configured = () => carregarTodaConfiguracao();

// O histórico é imutável: comparação usa o mesmo catálogo ativo nos dois motores.
test('núcleo extraído preserva a fórmula de cinco planos antes da retirada comercial', () => {
    const config = configured();
    config.catalogo = historical.plans;
    const engine = createEngine(config);
    for (const scenario of references.scenarios) {
        const old = historical.recommendPlans(scenario.answers);
        const actual = engine.recommendPlans(scenario.answers);
        assert.deepEqual(actual.all.map((p) => [p.plan.slug, p.score, p.pricing, p.sectorFit]), old.all.map((p) => [p.plan.slug, p.score, p.pricing, p.sectorFit]), scenario.id);
        assert.deepEqual(engine.buildUserProfile(scenario.answers), historical.buildUserProfile(scenario.answers), scenario.id);
        assert.deepEqual(engine.detectConflicts(scenario.answers), historical.detectConflicts(scenario.answers), scenario.id);
    }
});

test('quatro planos usam a mesma fórmula com mínimo e máximo do catálogo ativo', () => {
    const active = historical.plans.filter((p) => p.slug !== 'cabuloso-cativo');
    for (const scenario of references.scenarios) {
        const expected = historical.recommendPlans(scenario.answers, active);
        const actual = current.recommendPlans(scenario.answers);
        assert.deepEqual(actual.all.map((p) => [p.plan.slug, p.score]), expected.all.map((p) => [p.plan.slug, p.score]), scenario.id);
    }
});

test('alterações reais de perfil e ranking são aplicadas em instâncias isoladas', () => {
    const config = configured();
    const base = createEngine(config);
    const answers = { ...complete, gamesPerYear: 15, wantsGuaranteedTicket: false, gameFrequency: 'frequent', budget: 400 };
    const before = base.recommendPlans(answers);
    config.pesosRanking.price.base = 30;
    config.pesosPerfil.prioridad.false = 9;
    const changed = createEngine(validateConfiguration(config));
    assert.notDeepEqual(changed.recommendPlans(answers).all.map((p) => p.score), before.all.map((p) => p.score));
    assert.equal(changed.buildUserProfile(answers).prioridad, 9);
    assert.deepEqual(base.recommendPlans(answers), before);
    config.catalogo[0].nome = 'Não deve contaminar a instância';
    assert.equal(changed.plans[0].nome, 'Meu Cruzeiro');
    assert.ok(Object.isFrozen(changed.plans[0].contratacao));
});

test('questões reordenadas preservam valores tipados, validação e pontuação', () => {
    const config = configured();
    config.questoes.reverse();
    config.questoes[0].title = 'Texto revisado';
    const engine = createEngine(validateConfiguration(config));
    assert.equal(engine.questions[0].title, 'Texto revisado');
    assert.deepEqual(engine.validateAnswers(complete), current.validateAnswers(complete));
    assert.deepEqual(engine.recommendPlans(complete).all.map((p) => p.score), current.recommendPlans(complete).all.map((p) => p.score));
});

const invalid = [
    ['valor booleano convertido para string', (c) => { c.questoes.find((q) => q.key === 'needsPriority').options[0].value = 'true'; }],
    ['chave semântica desconhecida', (c) => { c.questoes[0].key = 'novaPergunta'; }],
    ['chave duplicada', (c) => { c.questoes[1].key = c.questoes[0].key; }],
    ['peso negativo', (c) => { c.pesosRanking.price.base = -1; }],
    ['peso descrito como código', (c) => { c.pesosRanking.price.base = 'eval(1)'; }],
    ['normalização com divisor zero', (c) => { c.pesosRanking.discount.referencia = 0; }],
    ['perfil sem soma positiva', (c) => { c.pesosPerfil.frecuencia.volume = 0; c.pesosPerfil.frecuencia.presenca = 0; c.pesosPerfil.frecuencia.declaracao = 0; }],
    ['utilidade fora do domínio', (c) => { c.pesosRanking.ticket.utilidades.popular = 2; }],
    ['propriedade desconhecida aninhada', (c) => { c.catalogo[0].contratacao.inventado = true; }],
    ['catálogo vazio', (c) => { c.catalogo = []; }],
    ['slug duplicado', (c) => { c.catalogo[1].slug = c.catalogo[0].slug; }],
    ['setor desconhecido', (c) => { c.catalogo[0].ingresso.setores[0] = 'setor-inexistente'; }],
    ['níveis sobrepostos', (c) => { c.catalogo[2].ingresso.niveis[1].jogosMinimos = 9; }],
    ['link com destino não permitido', (c) => { c.catalogo[0].contratacao.link = 'https://example.test/checkout'; }],
    ['identificador de oferta não corresponde ao checkout', (c) => { c.catalogo[0].id = 999; }],
    ['preço inconsistente com modalidade', (c) => { c.catalogo[0].contratacao.precoMensalEquivalente = 13; }],
    ['evento excede teto interno', (c) => { c.ga4.eventos.find((e) => e.chave === 'quiz_complete').camposPrincipais.push('extra'); }],
    ['remoção de rules_version sem migração', (c) => { const e = c.ga4.eventos.find((e) => e.chave === 'quiz_complete'); e.camposPrincipais = e.camposPrincipais.filter((p) => p !== 'rules_version'); }],
    ['tipos GA4 ausentes', (c) => { delete c.ga4.eventos[1].tipos.answer_time_sec; }],
    ['campo legado de conclusão removido', (c) => { const e = c.ga4.eventos[2]; e.camposPrincipais = e.camposPrincipais.filter((field) => field !== 'compatibility'); }],
    ['host com curinga', (c) => { c.ga4.ambientesHabilitados = ['*.vercel.app']; }]
];
for (const [name, mutate] of invalid) {
    test(`configuração inválida é recusada: ${name}`, () => {
        const config = configured();
        mutate(config);
        assert.throws(() => validateConfiguration(config), /Configuração inválida/);
    });
}

test('nome wire de evento é editável sem mudar sua identidade semântica', () => {
    const config = configured();
    config.ga4.eventos[0].nome = 'quiz_inicio';
    assert.equal(validateConfiguration(config).ga4.eventos[0].chave, 'quiz_start');
});

test('sem elegíveis, somente catálogo informativo contém planos fora do teto', () => {
    const result = current.recommendPlans({ ...complete, budget: 0 });
    assert.equal(result.winner, null);
    assert.deepEqual(result.recommendations, []);
    assert.equal(result.all.length, 4);
    assert.ok(result.all.every((p) => !p.eligibility.withinBudget));
});
