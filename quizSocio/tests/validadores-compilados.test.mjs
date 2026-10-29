import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { carregarTodaConfiguracao } from '../config/adapter.js';
import { validadores as nodeValidadores, errosTexto as textoNode } from '../config/validadores-ajv.js';
import { validadores as compilados, errosTexto as textoCompilado, carregarConfiguracao } from '../config/validadores-compilados.mjs';

const configuracao = carregarTodaConfiguracao();

/** Configurações quebradas: estrutura inválida e incompatibilidade semântica. */
const configuracoesQuebradas = [
    ['catalogo', 'sem slug', (c) => { delete c.catalogo[0].slug; }],
    ['catalogo', 'preço negativo', (c) => { c.catalogo[0].contratacao.precoMensalEquivalente = -1; }],
    ['catalogo', 'campo desconhecido', (c) => { c.catalogo[1].extra = true; }],
    ['catalogo', 'URI inválida', (c) => { c.catalogo[0].contratacao.link = 'https://socio.cruzeiro.com.br/um caminho com espaços'; }],
    ['questoes', 'menos de 12', (c) => { c.questoes.pop(); }],
    ['questoes', 'tipo trocado', (c) => { c.questoes[0].type = 'boolean'; }],
    ['pesosRanking', 'divisor com tipo inválido', (c) => { c.pesosRanking.priority.intervalo = 'zero'; }],
    ['pesosPerfil', 'propriedade não permitida', (c) => { c.pesosPerfil.foo = 1; }],
    ['ga4', 'measurementId fora do padrão', (c) => { c.ga4.propriedade.measurementId = 'G-999x'; }],
    ['ga4', 'teto de parâmetros estourado', (c) => { c.ga4.limiteParametrosPersonalizados = 50; }]
];

function quebrada(mudanca) {
    const copia = structuredClone(configuracao);
    mudanca(copia);
    return copia;
}

/** Exercita o validador com dado quebrado e devolve errors non-null. */
function errosDe(validar, domain, dados) {
    const valido = validar(dados);
    assert.equal(valido, false, `configuração quebrada precisa ser rejeitada (${domain})`);
    return validar.errors;
}

/** Lista canônica de erros: caminho + mensagem, na ordem em que o Ajv lista. */
const tratados = (erros) => (erros ?? []).map((e) => `${e.instancePath} ${e.message}`);

test('validadores compilados aceitam a configuração ativa como o Ajv', () => {
    for (const [domain, node] of Object.entries(nodeValidadores)) {
        assert.equal(compilados[domain](configuracao[domain]), true, domain);
        assert.equal(node(configuracao[domain]), true, domain);
    }
});

for (const [domain, descricao, mudanca] of configuracoesQuebradas) {
    test(`erro idêntico: ${domain} — ${descricao}`, () => {
        const dados = quebrada(mudanca)[domain];
        const errosNode = errosDe(nodeValidadores[domain], domain, dados);
        const errosCompilados1 = errosDe(compilados[domain], domain, dados);
        // allErrors preservado: os dois listam os mesmos erros, na mesma ordem.
        assert.deepEqual(tratados(errosCompilados1), tratados(errosNode), `${domain}/${descricao}`);
        assert.equal(textoCompilado(errosCompilados1, domain), textoNode(errosNode, domain), 'texto de erro precisa ser idêntico');
    });
}

test('último estado de errors limpo depois de dado válido', () => {
    const quebrado = quebrada((c) => { c.ga4.propriedade.measurementId = 'G-999x'; }).ga4;
    assert.equal(compilados.ga4(quebrado), false);
    assert.equal(compilados.ga4(configuracao.ga4), true);
    assert.equal(compilados.ga4.errors, null);
});

test('carregarConfiguracao pré-compilado valida o catálogo e falha com o prefixo canônico', () => {
    assert.deepEqual(carregarConfiguracao(configuracao.catalogo, { $id: 'https://quiz-socio.vercel.app/config/planos/catalogo.schema.json' }), configuracao.catalogo);
    const quebrado = quebrada((c) => { c.catalogo[2].contratacao.precoMensalEquivalente = -5; }).catalogo[2];
    assert.throws(() => carregarConfiguracao(quebrado, { $id: 'https://quiz-socio.vercel.app/config/planos/catalogo.schema.json', title: 'Catálogo' }), /Configuração inválida \[Catálogo\]/);
    assert.throws(() => carregarConfiguracao({}, { $id: 'https://dominio.invalido/schema.json' }), /pré-compilado indisponível/);
});

test('bundle do navegador tem os validadores gerados e não tem o compilador Ajv', async () => {
    const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'assets');
    let arquivos;
    try {
        arquivos = (await readdir(dist)).filter((f) => f.endsWith('.js'));
    } catch {
        assert.skip('dist ausente: rode npm run build antes');
        return;
    }
    assert.ok(arquivos.length > 0, 'bundle precisa ter JavaScript');
    const todos = (await Promise.all(arquivos.map((f) => readFile(path.join(dist, f), 'utf8')))).join('\n');
    assert.ok(todos.includes('must NOT have additional properties'), 'validadores pré-compilados precisam estar no bundle');
    assert.ok(!todos.includes('no schema with key or ref'), 'compilador Ajv não pode estar no bundle');
});
