/*
 * Meta-teste da simulação de 19 perfis. Verifica o avaliador e os invariantes do motor;
 * nunca exige que as expectativas congeladas coincidam com o motor (divergência é achado).
 * Fora da lista do package.json por decisão do plano: node --test tests/simulacao-perfis.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import engine from '../quiz-engine.js';
import { evaluateScenarios } from '../scripts/evaluate-reference.mjs';
import {
    FIXTURE_PATH, FIXTURE_SHA256, carregarFixture, validarFixture, paraCenario, executar, verificarInvariantes, diagnosticar
} from '../scripts/simular-perfis.mjs';

const hashDoArquivo = () => createHash('sha256').update(fs.readFileSync(FIXTURE_PATH)).digest('hex');
const HASH_INICIAL = hashDoArquivo();
const { fixture } = carregarFixture();
const execucao = executar(fixture);
const slugs = engine.plans.map((plan) => plan.slug);
const indicadoSemLimite = (id) => execucao.resultados[id][400].indicado;
const comEsperado = (perfil, slug) => ({ ...structuredClone(perfil), acceptable: [slug] });

test('fixture é a congelada e passa nas pré-condições', () => {
    assert.equal(HASH_INICIAL, FIXTURE_SHA256);
    assert.deepEqual(validarFixture(fixture), []);
    assert.throws(() => carregarFixture({ hashEsperado: '0'.repeat(64) }), /diverge do congelamento/);
});

test('expectativa trocada por outro plano é registrada como divergência', () => {
    for (const perfil of fixture.perfis) {
        const errado = slugs.find((slug) => slug !== indicadoSemLimite(perfil.id));
        const alterado = comEsperado(perfil, errado);
        const avaliacao = evaluateScenarios([paraCenario(alterado)], { motor: engine, baseline: null });
        assert.equal(avaliacao.rows[0].top1, false, perfil.id);
        const diagnostico = diagnosticar({ ...fixture, perfis: fixture.perfis.map((item) => (item.id === perfil.id ? alterado : item)) }, execucao);
        const linha = diagnostico.perfis.find((item) => item.id === perfil.id);
        assert.equal(linha.acerto, false, perfil.id);
        assert.equal(linha.decomposicao.para, errado, 'a divergência é decomposta contra o plano esperado');
    }
});

test('expectativa igual ao indicado é registrada como acerto, então o avaliador não reprova tudo', () => {
    for (const perfil of fixture.perfis) {
        const certo = comEsperado(perfil, indicadoSemLimite(perfil.id));
        assert.equal(evaluateScenarios([paraCenario(certo)], { motor: engine, baseline: null }).rows[0].top1, true, perfil.id);
        const diagnostico = diagnosticar({ ...fixture, perfis: fixture.perfis.map((item) => (item.id === perfil.id ? certo : item)) }, execucao);
        assert.equal(diagnostico.perfis.find((item) => item.id === perfil.id).acerto, true, perfil.id);
    }
});

test('pré-condições recusam contradição, resposta faltando, chave extra, duplicata e distribuição errada', () => {
    const mutar = (alterar) => {
        const copia = structuredClone(fixture);
        alterar(copia.perfis);
        return validarFixture(copia).join('\n');
    };
    assert.match(mutar((perfis) => { perfis[0].answers.gameFrequency = 'always'; }), /MC-1@400: contradição/);
    assert.match(mutar((perfis) => { delete perfis[1].answers.kidsCount; }), /MC-2: faltam respostas \(kidsCount\)/);
    assert.match(mutar((perfis) => { perfis[2].answers.extra = true; }), /MC-3: chaves desconhecidas \(extra\)/);
    assert.match(mutar((perfis) => { perfis[3].answers = structuredClone(perfis[4].answers); perfis[3].mudancas = ['gamesPerYear']; }), /mesmas respostas de/);
    assert.match(mutar((perfis) => { perfis[0].intensidade = 'migração'; perfis[0].origem = 'MC-3'; }), /meu-cruzeiro: 2 migrações/);
    assert.match(mutar((perfis) => { perfis.find((p) => p.id === 'CA-4').mudancas = ['preferredSector']; }), /CA-4: mudanças declaradas/);
    assert.match(mutar((perfis) => { perfis.pop(); }), /São 18 perfis/);
});

test('invariantes valem nas 76 execuções: orçamento só filtra e o resultado é determinístico', () => {
    assert.equal(execucao.deterministico, true);
    assert.deepEqual(verificarInvariantes(fixture, execucao), []);
    for (const perfil of fixture.perfis) {
        const porOrcamento = execucao.resultados[perfil.id];
        assert.deepEqual(porOrcamento[200].indices, porOrcamento[400].indices, perfil.id);
        assert.deepEqual(porOrcamento[40].elegiveis.every((slug) => ['meu-cruzeiro', 'time-do-povo'].includes(slug)), true, perfil.id);
    }
});

test('invariante acusa troca de indicado sem exclusão por orçamento', () => {
    const adulterada = structuredClone(execucao);
    const alvo = adulterada.resultados['MC-1'][200];
    alvo.indicado = slugs.find((slug) => slug !== alvo.indicado);
    assert.match(verificarInvariantes(fixture, adulterada).join('\n'), /MC-1@200: o indicado mudou sem exclusão/);
});

test('a fixture não muda durante os testes', () => {
    assert.equal(hashDoArquivo(), HASH_INICIAL);
});
