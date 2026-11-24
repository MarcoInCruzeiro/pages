/**
 * Simulação diagnóstica dos 19 perfis congelados em tests/fixtures/simulacao-19-perfis.json.
 *
 * Não altera motor, configuração, avaliador nem expectativas. Separa três coisas:
 * pré-condições (falha impede calcular recomendações), invariantes (falha é defeito e
 * interrompe sem gravar) e divergências (achado do diagnóstico, nunca falha).
 *
 * Uso, a partir de quizSocio/, depois de gravar as duas avaliações das 40 referências na
 * pasta de evidências do dia (ver "Reprodução" no relatório):
 *   node scripts/simular-perfis.mjs [--data AAAA-MM-DD]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import engine from '../quiz-engine.js';
import { evaluateScenarios } from './evaluate-reference.mjs';
import { canonicalize, inspectConfiguration, projectRoot } from './config-release.mjs';

export const FIXTURE_PATH = path.join(projectRoot, 'tests/fixtures/simulacao-19-perfis.json');
/** Congelado no commit 37d01ee, antes de qualquer execução do motor nestes perfis. */
export const FIXTURE_SHA256 = 'dff628c1da4686de22c75a27b8f734283eb04a08170dacb72da26c1b0e2170f0';
export const FIXTURE_COMMIT = '37d01ee01dda0cb040cae8cf7101ec0dd74b9f8f';
export const ORCAMENTOS = Object.freeze([400, 200, 100, 40]);
const PRINCIPAL = 400;
const GRUPOS = Object.freeze({
    'meu-cruzeiro': { total: 4, migracoes: 1 },
    'time-do-povo': { total: 5, migracoes: 2 },
    cabuloso: { total: 5, migracoes: 2 },
    'cabuloso-max': { total: 5, migracoes: 2 }
});
const PROPRIOS = Object.freeze(['puro', 'forte', 'moderado']);
const MIGRACAO = 'migração';
const INTENSIDADES = Object.freeze([...PROPRIOS, MIGRACAO]);
const COMPONENTES = Object.freeze({
    ticket: { nome: 'Ingresso', regra: '`ranking.ticket` e `getTicketUtility`' },
    priority: { nome: 'Prioridade', regra: '`ranking.priority` e `getPriority`' },
    sector: { nome: 'Setor', regra: '`ranking.sector` e `getSectorFit`' },
    discount: { nome: 'Desconto na loja', regra: '`ranking.discount` e `perfil.descuentos`' },
    experiences: { nome: 'Experiências e conteúdo', regra: '`ranking.experiences` e `perfil.experiencias`' },
    family: { nome: 'Acompanhantes e Kids', regra: '`ranking.family`' }
});

const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const hashCanonico = (value) => sha256(canonicalize(value));
const umaCasa = (value) => Math.round(value * 10) / 10;
const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

/** Lê a fixture e recusa qualquer conteúdo diferente do congelado. */
export function carregarFixture({ caminho = FIXTURE_PATH, hashEsperado = FIXTURE_SHA256 } = {}) {
    const bytes = fs.readFileSync(caminho);
    const hash = sha256(bytes);
    if (hash !== hashEsperado) {
        throw new Error(`Fixture diverge do congelamento (${hash} ≠ ${hashEsperado}). Expectativas não mudam depois de congeladas.`);
    }
    return { fixture: JSON.parse(bytes.toString('utf8')), sha256: hash };
}

/** Cenário no formato do avaliador existente, com o orçamento da execução. */
export function paraCenario(perfil, orcamento = PRINCIPAL) {
    return {
        id: `${perfil.id}@${orcamento}`, split: `orcamento-${orcamento}`, category: perfil.grupo, profileId: perfil.id,
        answers: { ...perfil.answers, budget: orcamento }, acceptable: perfil.acceptable.slice(), reason: perfil.reason
    };
}

/** Pré-condições. Lista todos os problemas; não calcula nenhuma recomendação. */
export function validarFixture(fixture, motor = engine) {
    const problemas = [];
    const perfis = Array.isArray(fixture?.perfis) ? fixture.perfis : [];
    const chaves = motor.questions.map((question) => question.key);
    const slugs = motor.plans.map((plan) => plan.slug);
    const porId = new Map(perfis.map((perfil) => [perfil.id, perfil]));
    const assinaturas = new Map();
    if (perfis.length !== 19) problemas.push(`São ${perfis.length} perfis; o plano exige 19.`);
    if (porId.size !== perfis.length) problemas.push('Há IDs repetidos.');

    for (const perfil of perfis) {
        const rotulo = perfil.id ?? '(sem ID)';
        const respostas = perfil.answers ?? {};
        const faltando = chaves.filter((key) => !Object.hasOwn(respostas, key));
        const sobrando = Object.keys(respostas).filter((key) => !chaves.includes(key));
        if (faltando.length) problemas.push(`${rotulo}: faltam respostas (${faltando.join(', ')}).`);
        if (sobrando.length) problemas.push(`${rotulo}: chaves desconhecidas (${sobrando.join(', ')}).`);
        if (respostas.budget !== PRINCIPAL) problemas.push(`${rotulo}: o orçamento principal deve ser ${PRINCIPAL}.`);
        for (const orcamento of ORCAMENTOS) {
            const variacao = { ...respostas, budget: orcamento };
            const invalidas = motor.validateAnswers(variacao).map((item) => item.key);
            const conflitos = motor.detectConflicts(variacao).map((item) => item.message);
            if (invalidas.length) problemas.push(`${rotulo}@${orcamento}: respostas inválidas (${invalidas.join(', ')}).`);
            if (conflitos.length) problemas.push(`${rotulo}@${orcamento}: contradição (${conflitos.join(' ')}).`);
        }
        const assinatura = JSON.stringify(chaves.map((key) => respostas[key] ?? null));
        if (assinaturas.has(assinatura)) problemas.push(`${rotulo}: mesmas respostas de ${assinaturas.get(assinatura)}.`);
        else assinaturas.set(assinatura, rotulo);

        if (!Array.isArray(perfil.acceptable) || perfil.acceptable.length !== 1 || !slugs.includes(perfil.acceptable[0])) {
            problemas.push(`${rotulo}: precisa de exatamente um plano esperado do catálogo.`);
        }
        if (typeof perfil.reason !== 'string' || !perfil.reason.trim()) problemas.push(`${rotulo}: justificativa ausente.`);
        if (!Object.hasOwn(GRUPOS, perfil.grupo)) problemas.push(`${rotulo}: grupo desconhecido.`);

        if (perfil.intensidade === MIGRACAO) {
            const origem = porId.get(perfil.origem);
            if (!origem) {
                problemas.push(`${rotulo}: migração sem perfil de origem válido.`);
            } else {
                if (origem.grupo !== perfil.grupo) problemas.push(`${rotulo}: a origem pertence a outro grupo.`);
                if (origem.intensidade === MIGRACAO) problemas.push(`${rotulo}: a origem deve ser um perfil próprio do grupo.`);
                const mudancas = chaves.filter((key) => !Object.is(respostas[key], origem.answers?.[key]));
                if (JSON.stringify(mudancas) !== JSON.stringify(perfil.mudancas)) {
                    problemas.push(`${rotulo}: mudanças declaradas (${(perfil.mudancas ?? []).join(', ')}) diferem das respostas (${mudancas.join(', ')}).`);
                }
            }
            if (perfil.acceptable?.[0] === perfil.grupo) problemas.push(`${rotulo}: uma migração espera outro plano.`);
        } else if (PROPRIOS.includes(perfil.intensidade)) {
            if (perfil.origem !== null || perfil.mudancas?.length) problemas.push(`${rotulo}: perfil próprio não tem origem nem mudanças.`);
            if (perfil.acceptable?.[0] !== perfil.grupo) problemas.push(`${rotulo}: perfil próprio espera o plano do grupo.`);
        } else {
            problemas.push(`${rotulo}: intensidade desconhecida.`);
        }
    }

    for (const [grupo, regra] of Object.entries(GRUPOS)) {
        const doGrupo = perfis.filter((perfil) => perfil.grupo === grupo);
        const migracoes = doGrupo.filter((perfil) => perfil.intensidade === MIGRACAO).length;
        if (doGrupo.length !== regra.total) problemas.push(`${grupo}: ${doGrupo.length} perfis; o plano exige ${regra.total}.`);
        if (migracoes !== regra.migracoes) problemas.push(`${grupo}: ${migracoes} migrações; o plano exige ${regra.migracoes}.`);
        for (const intensidade of PROPRIOS) {
            const total = doGrupo.filter((perfil) => perfil.intensidade === intensidade).length;
            if (total !== 1) problemas.push(`${grupo}: ${total} perfis "${intensidade}"; o plano exige 1.`);
        }
    }
    return problemas;
}

/** Identidade por conteúdo: o motor avaliado pode não ter commit. */
export function identidadeDaExecucao({ motor = engine } = {}) {
    const inspecao = inspectConfiguration();
    if (inspecao.pendingChanges) {
        throw new Error('Configuração ou motor mudaram sem revisão preparada (config:prepare); as versões declaradas não descrevem o código.');
    }
    if (motor.RULES_VERSION !== inspecao.versions.rulesVersion || motor.CATALOG_VERSION !== inspecao.versions.catalogVersion) {
        throw new Error('O motor carregado não corresponde à revisão em disco.');
    }
    const git = (...args) => execFileSync('git', ['-C', projectRoot, ...args], { encoding: 'utf8' });
    const linhas = (texto) => texto.split('\n').filter(Boolean).map((linha) => linha.trim());
    const arquivo = (nome) => sha256(fs.readFileSync(path.join(projectRoot, nome)));
    const { hashes } = inspecao;
    return {
        versoes: { ...inspecao.versions },
        hashes: {
            rules: hashes.rules, aggregate: hashes.aggregate, engine: hashes.engine, catalog: hashes.catalog,
            questions: hashes.questions, ranking: hashes.ranking, profile: hashes.profile
        },
        git: {
            head: git('rev-parse', 'HEAD').trim(),
            branch: git('branch', '--show-current').trim(),
            entradasAlteradasNoQuiz: linhas(git('status', '--porcelain', '--', '.')).length,
            alteracoesEmSrcEConfig: linhas(git('status', '--porcelain', '--', 'src', 'config'))
        },
        node: process.version,
        arquivos: {
            fixture: arquivo('tests/fixtures/simulacao-19-perfis.json'),
            avaliador: arquivo('scripts/evaluate-reference.mjs'),
            simulacao: arquivo('scripts/simular-perfis.mjs')
        }
    };
}

function criterioDeDecisao(winner, runnerUp) {
    if (!winner) return null;
    if (!runnerUp) return 'único elegível';
    if (winner.score !== runnerUp.score) return 'índice';
    return winner.profileFit !== runnerUp.profileFit ? 'finalidade do produto' : 'ordem alfabética do slug';
}

function extrairResultado(result, orcamento) {
    const slug = (item) => item?.plan.slug ?? null;
    const { winner, runnerUp } = result;
    const margem = winner && runnerUp ? umaCasa(winner.score - runnerUp.score) : null;
    return {
        orcamento,
        indicado: slug(winner),
        elegiveis: result.eligible.map(slug),
        alternativas: result.recommendations.slice(1).map(slug),
        alternativaDeSetor: slug(result.sectorAlternative),
        coberturaDoSetor: winner ? winner.sectorFit.level : null,
        indices: Object.fromEntries(result.all.map((item) => [item.plan.slug, item.score])),
        finalidade: Object.fromEntries(result.all.map((item) => [item.plan.slug, item.profileFit])),
        componentes: Object.fromEntries(result.all.map((item) => [item.plan.slug,
            Object.fromEntries(item.components.map((c) => [c.key, { peso: c.weight, valor: c.value }]))])),
        margem,
        criterio: criterioDeDecisao(winner, runnerUp),
        unicoIndicado: Boolean(winner) && result.recommendations[0] === winner && result.closeCall === false,
        semElegivel: result.noEligible,
        justificativa: { recomendacao: result.recommendationReason, motivos: winner ? winner.reasons.slice() : [] }
    };
}

/** Executa um perfil nos quatro tetos, pelo avaliador existente e pelo resultado completo do motor. */
export function simularPerfil(perfil, motor = engine) {
    return Object.fromEntries(ORCAMENTOS.map((orcamento) => {
        const cenario = paraCenario(perfil, orcamento);
        const linha = evaluateScenarios([cenario], { motor, baseline: null }).rows[0];
        return [orcamento, {
            ...extrairResultado(motor.recommendPlans(cenario.answers), orcamento),
            avaliador: {
                primeiroAceitavel: linha.top1, ranking: linha.ranking,
                violacaoDeOrcamento: linha.budgetViolation, violacaoDeIndice: linha.scoreViolation
            }
        }];
    }));
}

/** Duas passadas completas; a comparação dos hashes verifica o determinismo. */
export function executar(fixture, motor = engine) {
    const passada = () => Object.fromEntries(fixture.perfis.map((perfil) => [perfil.id, simularPerfil(perfil, motor)]));
    const primeira = passada();
    const segunda = passada();
    return { resultados: primeira, hash: hashCanonico(primeira), deterministico: hashCanonico(primeira) === hashCanonico(segunda) };
}

/** Invariantes do motor. Qualquer falha é defeito: a execução para e nada vira resultado. */
export function verificarInvariantes(fixture, execucao, motor = engine) {
    const falhas = [];
    const preco = Object.fromEntries(motor.plans.map((plan) => [plan.slug, plan.contratacao.precoMensalEquivalente]));
    if (!execucao.deterministico) falhas.push('Mesmas respostas e configuração produziram resultados diferentes entre as duas passadas.');
    for (const perfil of fixture.perfis) {
        const porOrcamento = execucao.resultados[perfil.id];
        const base = porOrcamento[PRINCIPAL];
        for (const orcamento of ORCAMENTOS) {
            const r = porOrcamento[orcamento];
            const id = `${perfil.id}@${orcamento}`;
            if (!r.unicoIndicado || r.semElegivel || !r.indicado) falhas.push(`${id}: não há exatamente um indicado.`);
            if (r.indicado && preco[r.indicado] > orcamento) falhas.push(`${id}: indicado acima do teto.`);
            if (r.elegiveis.some((slug) => preco[slug] > orcamento) || r.avaliador.violacaoDeOrcamento) falhas.push(`${id}: plano acima do teto entre os elegíveis.`);
            if (r.avaliador.violacaoDeIndice) falhas.push(`${id}: índice fora da faixa de 0 a 100.`);
            if (canonicalize(r.avaliador.ranking) !== canonicalize(r.elegiveis)) falhas.push(`${id}: avaliador e motor divergem na ordem.`);
            if (canonicalize(r.indices) !== canonicalize(base.indices)) falhas.push(`${id}: o orçamento alterou índices.`);
            const filtrada = base.elegiveis.filter((slug) => preco[slug] <= orcamento);
            if (canonicalize(r.elegiveis) !== canonicalize(filtrada)) falhas.push(`${id}: mudou a ordem dos planos que continuam elegíveis.`);
            if (r.indicado !== base.indicado && preco[base.indicado] <= orcamento) falhas.push(`${id}: o indicado mudou sem exclusão por orçamento.`);
        }
        const { orcamento: _teto200, ...com200 } = porOrcamento[200];
        const { orcamento: _semLimite, ...semLimite } = base;
        if (canonicalize(com200) !== canonicalize(semLimite)) falhas.push(`${perfil.id}: R$ 200 difere do orçamento sem limite.`);
    }
    return falhas;
}

/**
 * Diferença de índice entre dois planos, por componente. Os pesos dependem só do perfil,
 * então a soma das contribuições é a diferença exata antes do arredondamento.
 */
export function decompor(resultado, de, para) {
    const a = resultado.componentes[de];
    const b = resultado.componentes[para];
    const chaves = Object.keys(COMPONENTES);
    if (chaves.some((key) => a[key].peso !== b[key].peso)) throw new Error('Pesos diferentes entre planos: a decomposição não se aplica.');
    const pesoTotal = chaves.reduce((soma, key) => soma + a[key].peso, 0);
    const componentes = chaves.map((key) => ({
        componente: key, peso: a[key].peso, valorDe: a[key].valor, valorPara: b[key].valor,
        contribuicao: a[key].peso * (a[key].valor - b[key].valor) / pesoTotal * 100
    }));
    return {
        de, para, pesoTotal, componentes,
        diferencaDosIndices: umaCasa(resultado.indices[de] - resultado.indices[para]),
        diferencaExata: componentes.reduce((soma, item) => soma + item.contribuicao, 0)
    };
}

const contar = (lista) => ({ total: lista.length, acertos: lista.filter((item) => item.acerto).length });

/** Diagnóstico com orçamento sem limite e projeção por teto. Divergência é achado, não falha. */
export function diagnosticar(fixture, execucao, motor = engine) {
    const slugs = motor.plans.map((plan) => plan.slug);
    const perfis = fixture.perfis.map((perfil) => {
        const r = execucao.resultados[perfil.id][PRINCIPAL];
        const esperado = perfil.acceptable[0];
        const acerto = r.indicado === esperado;
        const segundo = r.elegiveis[1] ?? null;
        // Empate segue o índice arredondado que o motor compara; "estreita" usa a diferença exata.
        const margemExata = segundo ? decompor(r, r.indicado, segundo).diferencaExata : null;
        const classeDaMargem = margemExata === null ? null : r.margem === 0 ? 'empate' : margemExata < 1 ? 'estreita' : 'clara';
        const decomposicao = !acerto ? decompor(r, r.indicado, esperado)
            : classeDaMargem !== 'clara' && segundo ? decompor(r, r.indicado, segundo) : null;
        // Plano com valor maior ou igual ao de todos os outros em todos os componentes.
        const dominante = slugs.find((candidato) => slugs.every((outro) => Object.keys(COMPONENTES)
            .every((key) => r.componentes[candidato][key].valor >= r.componentes[outro][key].valor))) ?? null;
        return {
            id: perfil.id, grupo: perfil.grupo, intensidade: perfil.intensidade, descricao: perfil.descricao,
            esperado, indicado: r.indicado, acerto, posicaoDoEsperado: r.elegiveis.indexOf(esperado) + 1,
            indices: r.indices, margem: r.margem, margemExata, classeDaMargem, criterio: r.criterio, dominante,
            alternativas: r.alternativas, alternativaDeSetor: r.alternativaDeSetor, coberturaDoSetor: r.coberturaDoSetor,
            justificativa: r.justificativa, origem: perfil.origem, mudancas: perfil.mudancas,
            indicadoNaOrigem: perfil.origem ? execucao.resultados[perfil.origem][PRINCIPAL].indicado : null,
            observacoes: perfil.observacoes ?? [], decomposicao
        };
    });

    const divergencias = perfis.filter((perfil) => !perfil.acerto);
    const regras = Object.fromEntries(Object.keys(COMPONENTES).map((key) => [key, { maiorContribuicao: 0, pontosAFavorDoIndicado: 0 }]));
    for (const perfil of divergencias) {
        const positivas = perfil.decomposicao.componentes.filter((item) => item.contribuicao > 0);
        for (const item of positivas) regras[item.componente].pontosAFavorDoIndicado += item.contribuicao;
        const maior = positivas.sort((x, y) => y.contribuicao - x.contribuicao)[0];
        if (maior) regras[maior.componente].maiorContribuicao += 1;
    }

    const orcamento = fixture.perfis.map((perfil) => {
        const porOrcamento = execucao.resultados[perfil.id];
        const base = porOrcamento[PRINCIPAL].indicado;
        return {
            id: perfil.id,
            indicados: Object.fromEntries(ORCAMENTOS.map((teto) => [teto, porOrcamento[teto].indicado])),
            trocas: ORCAMENTOS.filter((teto) => porOrcamento[teto].indicado !== base)
                .map((teto) => ({ orcamento: teto, de: base, para: porOrcamento[teto].indicado }))
        };
    });

    return {
        perfis,
        acertos: perfis.filter((perfil) => perfil.acerto).length,
        total: perfis.length,
        matriz: Object.fromEntries(slugs.map((esperado) => [esperado, Object.fromEntries(slugs.map((indicado) => [indicado,
            perfis.filter((perfil) => perfil.esperado === esperado && perfil.indicado === indicado).length]))])),
        porGrupo: Object.fromEntries(Object.keys(GRUPOS).map((grupo) => [grupo, contar(perfis.filter((perfil) => perfil.grupo === grupo))])),
        porIntensidade: Object.fromEntries(INTENSIDADES.map((item) => [item, contar(perfis.filter((perfil) => perfil.intensidade === item))])),
        desempates: perfis.filter((perfil) => perfil.criterio !== 'índice').map((perfil) => ({ id: perfil.id, criterio: perfil.criterio })),
        margensEstreitas: perfis.filter((perfil) => perfil.classeDaMargem === 'estreita')
            .map((perfil) => ({ id: perfil.id, margem: perfil.margem, margemExata: perfil.margemExata })),
        dominancia: Object.fromEntries(slugs.map((slug) => [slug, perfis.filter((perfil) => perfil.dominante === slug).map((perfil) => perfil.id)])),
        divergenciasPorDesempate: divergencias.filter((perfil) => perfil.criterio !== 'índice').map((perfil) => perfil.id),
        regras,
        orcamento,
        trocasPorTeto: Object.fromEntries(ORCAMENTOS.filter((teto) => teto !== PRINCIPAL)
            .map((teto) => [teto, orcamento.flatMap((item) => item.trocas.filter((troca) => troca.orcamento === teto))]))
    };
}

/** Resume as avaliações das 40 referências gravadas pela CLI existente, com a mesma identidade. */
export function resumirReferencias(diretorio, identidade) {
    return ['historical', 'profiles'].map((nome) => {
        const arquivo = path.join(diretorio, `referencia-${nome}.json`);
        const relativo = path.relative(projectRoot, arquivo);
        if (!fs.existsSync(arquivo)) {
            throw new Error(`Falta ${relativo}. Rode antes: node scripts/evaluate-reference.mjs${nome === 'profiles' ? ' --reference profiles' : ''} --output ${relativo}`);
        }
        const report = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
        if (report.engineSha256 !== identidade.hashes.engine || report.rulesVersion !== identidade.versoes.rulesVersion
            || report.configurationHash !== identidade.hashes.aggregate) {
            throw new Error(`${relativo}: avaliação gerada com outro motor ou outra configuração.`);
        }
        const margem = (row) => (row.scores.length > 1 ? umaCasa(row.scores[0].score - row.scores[1].score) : null);
        // Casos em que o Max cabe no orçamento e há uso presencial: os únicos que poderiam expor a dominância.
        const fixtureDaReferencia = JSON.parse(fs.readFileSync(path.join(projectRoot, 'tests/fixtures/four-plans', `${nome}.json`), 'utf8'));
        const respostas = new Map(fixtureDaReferencia.scenarios.map((scenario) => [scenario.id, scenario.answers]));
        const precoDoMax = engine.assinaturasSocios.cabulosoMax.contratacao.precoMensalEquivalente;
        const comMaxNoOrcamento = report.rows.filter((row) => {
            const answers = respostas.get(row.id);
            return answers && answers.budget >= precoDoMax && answers.gamesPerYear > 0 && answers.wantsGuaranteedTicket !== 'never';
        });
        return {
            referencia: nome, arquivo: path.basename(arquivo), sha256: report.referenceSha256, avaliadoEm: report.evaluatedAt,
            total: report.rows.length, primeiroAceitavel: report.rows.filter((row) => row.top1).length,
            divergencias: report.rows.filter((row) => !row.top1).map((row) => ({ id: row.id, aceitaveis: row.acceptable, indicado: row.ranking[0] ?? null })),
            regressoes: report.regressions.slice(),
            trocasEmRelacaoAoLegado: report.rows.filter((row) => row.winnerChanged).map((row) => row.id),
            empatesNoTopo: report.rows.filter((row) => margem(row) === 0).map((row) => row.id),
            margensAbaixoDeUm: report.rows.filter((row) => margem(row) !== null && margem(row) > 0 && margem(row) < 1)
                .map((row) => ({ id: row.id, margem: margem(row) })),
            violacoes: {
                orcamento: report.rows.filter((row) => row.budgetViolation).length,
                indice: report.rows.filter((row) => row.scoreViolation).length
            },
            presencialComMaxNoOrcamento: {
                total: comMaxNoOrcamento.length,
                aceitamMax: comMaxNoOrcamento.filter((row) => row.acceptable.includes('cabuloso-max')).length,
                ids: comMaxNoOrcamento.map((row) => row.id)
            }
        };
    });
}

/* ---------- Relatório em Markdown, gerado só a partir do JSON ---------- */

const NOMES = Object.fromEntries(engine.plans.map((plan) => [plan.slug, plan.nome]));
const ORDEM_DOS_PLANOS = engine.plans.map((plan) => plan.slug);
const nome = (slug) => (slug ? NOMES[slug] ?? slug : '—');
const num = (valor, casas = 1) => (valor === null || valor === undefined ? '—' : valor.toFixed(casas).replace('.', ','));
const sinal = (valor) => `${valor > 0 ? '+' : valor < 0 ? '−' : ''}${num(Math.abs(valor), 2)}`;
const dataBr = (iso) => iso.split('-').reverse().join('/');
const teto = (valor) => (valor === PRINCIPAL ? 'Sem limite (400)' : `R$ ${valor}`);
const lista = (itens, vazio = 'nenhum') => (itens.length ? itens.join(', ') : vazio);

export function gerarMarkdown(relatorio) {
    const { diagnostico: d, identidade: id, referencias, data } = relatorio;
    const pasta = `evidencias/simulacao-19-perfis-${data}`;
    const linhas = [];
    const push = (...items) => linhas.push(...items);
    const divergencias = d.perfis.filter((perfil) => !perfil.acerto);

    push(`# Simulação de 19 perfis de torcedor`, '',
        `Execução em ${dataBr(data)}. Diagnóstico do motor atual com expectativas congeladas antes da execução, no commit \`${relatorio.fixture.commit.slice(0, 7)}\` ([fixture](../tests/fixtures/simulacao-19-perfis.json), SHA-256 \`${relatorio.fixture.sha256}\`). Nenhum peso, regra, catálogo, avaliador ou expectativa foi alterado. Os perfis são sintéticos: acertos e divergências não medem precisão com usuários reais.`, '',
        `Dados completos: [resultado.json](${pasta}/resultado.json). As avaliações das 40 referências estão na mesma pasta.`, '');

    push('## Resumo', '',
        `- **Acertos com orçamento sem limite (valor 400):** ${d.acertos} de ${d.total}.`,
        `- **Divergências:** ${lista(divergencias.map((perfil) => `${perfil.id} (esperado ${nome(perfil.esperado)}, indicado ${nome(perfil.indicado)})`))}.`,
        `- **Vencedor decidido por desempate:** ${lista(d.desempates.map((item) => `${item.id} (${item.criterio})`))}.`,
        `- **Margem abaixo de 1 ponto:** ${lista(d.margensEstreitas.map((item) => `${item.id} (${num(item.margemExata, 2)} exata; ${num(item.margem)} arredondada)`))}.`,
        ...Object.entries(d.dominancia).filter(([, ids]) => ids.length).map(([slug, ids]) => `- **Dominância:** em ${ids.length} de ${d.total} perfis, o ${nome(slug)} tem valor maior ou igual ao dos outros planos nos seis componentes; nesses perfis nenhum plano pode superá-lo no índice, só empatar.`),
        `- **Orçamento:** ${ORCAMENTOS.filter((valor) => valor !== PRINCIPAL).map((valor) => `${teto(valor)}: ${d.trocasPorTeto[valor].length} troca(s) por exclusão`).join('; ')}. Nenhum invariante falhou.`,
        ...referencias.map((ref) => `- **Referência ${ref.referencia}:** ${ref.primeiroAceitavel} de ${ref.total} com primeiro lugar aceitável; ${ref.divergencias.length} divergência(s); ${ref.regressoes.length} regressão(ões).`), '');

    push('## Resultado por perfil (orçamento sem limite)', '',
        `Índices na ordem ${ORDEM_DOS_PLANOS.map(nome).join(' · ')}. Margem é a diferença entre os dois primeiros; abaixo de 1 ponto é estreita. "Decidido por" indica se o índice separou os dois primeiros ou se houve desempate.`, '',
        '| ID | Grupo · intensidade | Esperado | Indicado | Resultado | Posição do esperado | Índices | Margem | Decidido por | Alternativas |',
        '|---|---|---|---|---|---|---|---|---|---|');
    for (const perfil of d.perfis) {
        const alternativas = perfil.alternativas.map(nome).join(', ')
            + (perfil.alternativaDeSetor ? `; setor: ${nome(perfil.alternativaDeSetor)}` : '');
        const margem = num(perfil.margem) + (perfil.margemExata !== null && Math.abs(perfil.margemExata - perfil.margem) >= 0.005
            ? ` (exata ${num(perfil.margemExata, 2)})` : '');
        push(`| ${perfil.id} | ${nome(perfil.grupo)} · ${perfil.intensidade} | ${nome(perfil.esperado)} | ${nome(perfil.indicado)} | ${perfil.acerto ? 'acerto' : '**divergência**'} | ${perfil.posicaoDoEsperado}º | ${ORDEM_DOS_PLANOS.map((slug) => num(perfil.indices[slug])).join(' · ')} | ${margem} | ${perfil.criterio} | ${alternativas || '—'} |`);
    }
    push('');

    push('## Esperado × indicado', '', `| Esperado ↓ / indicado → | ${ORDEM_DOS_PLANOS.map(nome).join(' | ')} |`, `|---|${ORDEM_DOS_PLANOS.map(() => '---').join('|')}|`);
    for (const esperado of ORDEM_DOS_PLANOS) push(`| ${nome(esperado)} | ${ORDEM_DOS_PLANOS.map((indicado) => d.matriz[esperado][indicado]).join(' | ')} |`);
    push('', 'Grupos com 4 ou 5 perfis: as contagens abaixo descrevem estes casos e não são taxas.', '',
        '| Grupo de origem | Perfis | Acertos |', '|---|---|---|',
        ...Object.entries(d.porGrupo).map(([grupo, c]) => `| ${nome(grupo)} | ${c.total} | ${c.acertos} |`), '',
        '| Intensidade | Perfis | Acertos |', '|---|---|---|',
        ...Object.entries(d.porIntensidade).map(([item, c]) => `| ${item} | ${c.total} | ${c.acertos} |`), '');

    push('## Migrações', '', 'O quiz não pergunta o plano atual; cada migração é comparada com um perfil próprio do mesmo grupo.', '',
        '| ID | Origem (indicado na origem) | Respostas alteradas | Esperado | Indicado | Resultado |', '|---|---|---|---|---|---|');
    for (const perfil of d.perfis.filter((item) => item.intensidade === MIGRACAO)) {
        push(`| ${perfil.id} | ${perfil.origem} (${nome(perfil.indicadoNaOrigem)}) | ${perfil.mudancas.map((key) => `\`${key}\``).join(', ')} | ${nome(perfil.esperado)} | ${nome(perfil.indicado)} | ${perfil.acerto ? 'acerto' : '**divergência**'} |`);
    }
    push('');

    push('## Decomposição das divergências e das margens estreitas', '',
        'Os pesos dependem só do perfil, então a diferença de índice entre dois planos é a soma das contribuições de cada componente: peso × (valor do primeiro − valor do segundo) ÷ soma dos pesos × 100. Contribuição positiva favorece o primeiro plano da comparação.', '');
    const decompostos = d.perfis.filter((perfil) => perfil.decomposicao);
    if (!decompostos.length) push('Nenhum perfil divergiu ou teve margem estreita.', '');
    for (const perfil of decompostos) {
        const dec = perfil.decomposicao;
        const titulo = perfil.acerto
            ? `${perfil.id}: margem ${perfil.classeDaMargem === 'empate' ? 'zero' : 'estreita'} entre ${nome(dec.de)} e ${nome(dec.para)}`
            : `${perfil.id}: esperado ${nome(dec.para)}, indicado ${nome(dec.de)}`;
        push(`### ${titulo}`, '', `| Componente | Peso | Valor ${nome(dec.de)} | Valor ${nome(dec.para)} | Contribuição (pontos) |`, '|---|---|---|---|---|',
            ...dec.componentes.map((item) => `| ${COMPONENTES[item.componente].nome} | ${num(item.peso, 3)} | ${num(item.valorDe, 3)} | ${num(item.valorPara, 3)} | ${sinal(item.contribuicao)} |`),
            '', `Soma das contribuições: ${sinal(dec.diferencaExata)} pontos; diferença dos índices arredondados: ${num(dec.diferencaDosIndices)}. Decidido por: ${perfil.criterio}.`, '');
    }

    push('## Regras que merecem revisão (evidência)', '');
    if (!divergencias.length) {
        push('Nenhuma divergência: os dados não apontam regra a revisar. As margens estreitas e os desempates acima continuam sendo pontos de atenção.', '');
    } else {
        push('Componentes que favoreceram o plano indicado contra o esperado nas divergências. A seção aponta onde olhar; não propõe valores.', '',
            '| Componente | Divergências em que foi a maior contribuição | Pontos a favor do indicado (soma) | Onde está a regra |', '|---|---|---|---|',
            ...Object.entries(d.regras).filter(([, r]) => r.pontosAFavorDoIndicado > 0)
                .sort(([, a], [, b]) => b.pontosAFavorDoIndicado - a.pontosAFavorDoIndicado)
                .map(([key, r]) => `| ${COMPONENTES[key].nome} | ${r.maiorContribuicao} | ${sinal(r.pontosAFavorDoIndicado)} | ${COMPONENTES[key].regra} |`), '',
            `Divergências decididas por desempate (\`compareRanked\` e \`profileFit\`): ${lista(d.divergenciasPorDesempate)}.`, '');
    }
    for (const [slug, ids] of Object.entries(d.dominancia).filter(([, lista_]) => lista_.length)) {
        const ordem = [...ORDEM_DOS_PLANOS].sort();
        const enumerar = (nomes) => (nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}` : lista(nomes));
        const antes = [enumerar(ordem.slice(0, ordem.indexOf(slug)).map(nome))].filter((texto) => texto !== 'nenhum');
        const depois = [enumerar(ordem.slice(ordem.indexOf(slug) + 1).map(nome))].filter((texto) => texto !== 'nenhum');
        push(`**Causa estrutural.** Em ${ids.length} de ${d.total} perfis, o ${nome(slug)} tem valor maior ou igual ao dos outros três planos em todos os componentes. O índice é a média ponderada desses valores, com os mesmos pesos para todos os planos, então nenhum outro plano consegue superá-lo: no máximo empata, quando os componentes em que ele é maior têm peso zero, como nos perfis sem uso presencial. Com todos os planos no orçamento, só o desempate ou o filtro de preço afastam o ${nome(slug)}; pela ADR-0003, preço não pontua.`, '',
            `**Consequência.** Ajustar só os pesos de \`config/pesos/ranking.json\` não coloca outro plano acima do ${nome(slug)}; no máximo produz empate. Para quem vai ao estádio, a finalidade do produto vale 0 em todos os planos, e o empate segue a ordem alfabética do slug, que põe ${lista(antes)} antes do ${nome(slug)} e ${lista(depois)} depois. Assim, com o ${nome(slug)} no orçamento, ${lista(depois)} não podem ser indicados a quem vai ao estádio${antes.length ? `, e ${lista(antes)} só por empate` : ''}. As alavancas estão nos valores atribuídos aos benefícios (por exemplo, a prioridade que pesa para quem compra com calma e a utilidade do desconto de 65% para quem vai sozinho) ou na própria ADR-0003.`, '');
    }

    push('## Teste de orçamento', '',
        'Preços mensais: Meu Cruzeiro R$ 12, Time do Povo R$ 40, Cabuloso R$ 100 e Cabuloso Max R$ 200. A comparação aceita o valor igual ao teto. Com R$ 40 cabem Meu Cruzeiro e Time do Povo; com R$ 100, também o Cabuloso; com R$ 200 e sem limite, os quatro.',
        'Como índice e ordem não dependem do orçamento, o indicado em cada teto é o primeiro da ordem sem limite que cabe nele. Esta tabela é consequência dessa ordem, não evidência independente. As 19 execuções com R$ 200 são controle da borda inclusiva do Max e saíram idênticas às sem limite.', '',
        `| ID | ${ORCAMENTOS.map(teto).join(' | ')} |`, `|---|${ORCAMENTOS.map(() => '---').join('|')}|`);
    for (const item of d.orcamento) {
        push(`| ${item.id} | ${ORCAMENTOS.map((valor) => `${nome(item.indicados[valor])}${item.trocas.some((troca) => troca.orcamento === valor) ? ' (troca por exclusão)' : ''}`).join(' | ')} |`);
    }
    push('');
    for (const valor of ORCAMENTOS.filter((item) => item !== PRINCIPAL)) {
        const trocas = d.trocasPorTeto[valor];
        const pares = Object.entries(trocas.reduce((acc, troca) => {
            const chave = `${nome(troca.de)} → ${nome(troca.para)}`;
            acc[chave] = (acc[chave] ?? 0) + 1;
            return acc;
        }, {})).map(([chave, total]) => `${chave}: ${total}`);
        push(`- ${teto(valor)}: ${trocas.length} troca(s) por exclusão${pares.length ? ` (${pares.join('; ')})` : ''}; ${d.total - trocas.length} mantido(s).`);
    }
    push('', '"Mudança entre planos que continuam elegíveis" e "recomendação acima do teto" foram verificadas como invariantes nas 76 execuções e não ocorreram.', '');

    push('## Justificativa do motor', '');
    for (const perfil of d.perfis) {
        push(`**${perfil.id}** (indicado ${nome(perfil.indicado)}): ${perfil.justificativa.recomendacao}`, '',
            ...perfil.justificativa.motivos.map((motivo) => `- ${motivo}`), '');
    }

    push('## Tensões registradas antes da execução', '', 'Observações gravadas na fixture congelada; nenhuma mudou depois do resultado.', '');
    for (const perfil of d.perfis.filter((item) => item.observacoes.length)) push(`- **${perfil.id}:** ${perfil.observacoes.join(' ')}`);
    push('');

    push('## Referências existentes (40)', '',
        '"Trocas em relação ao motor legado" comparam com o motor antigo de cinco planos: são histórico, não erro. Divergência é primeiro lugar fora dos planos aceitáveis.', '',
        '| Referência | Casos | Primeiro lugar aceitável | Divergências | Regressões | Trocas em relação ao legado | Empates no topo | Margens abaixo de 1 ponto |', '|---|---|---|---|---|---|---|---|');
    for (const ref of referencias) {
        push(`| ${ref.referencia} | ${ref.total} | ${ref.primeiroAceitavel} | ${lista(ref.divergencias.map((item) => item.id))} | ${lista(ref.regressoes)} | ${lista(ref.trocasEmRelacaoAoLegado)} | ${lista(ref.empatesNoTopo)} | ${lista(ref.margensAbaixoDeUm.map((item) => `${item.id} (${num(item.margem)})`))} |`);
    }
    push('');
    const presenciais = referencias.reduce((soma, ref) => soma + ref.presencialComMaxNoOrcamento.total, 0);
    const aceitamMax = referencias.reduce((soma, ref) => soma + ref.presencialComMaxNoOrcamento.aceitamMax, 0);
    push(`Nas 40 referências, ${presenciais} casos têm uso presencial e o Cabuloso Max dentro do orçamento (${referencias.map((ref) => lista(ref.presencialComMaxNoOrcamento.ids)).join(', ')}); ${aceitamMax} deles aceitam o Cabuloso Max.${aceitamMax === presenciais ? ' Nenhum espera outro plano com o Max disponível, então a referência existente não consegue detectar a dominância descrita acima.' : ''}`, '');

    push('## Verificações executadas', '',
        ...relatorio.verificacoes.preCondicoes.map((item) => `- Pré-condição: ${item}.`),
        ...relatorio.verificacoes.invariantes.map((item) => `- Invariante: ${item}.`),
        `- Meta-teste do avaliador: \`node --test tests/simulacao-perfis.test.mjs\` (expectativa trocada vira divergência; expectativa igual ao indicado vira acerto; fixture inalterada).`, '');

    push('## Identidade da execução', '',
        `- Catálogo \`${id.versoes.catalogVersion}\`, regras \`${id.versoes.rulesVersion}\`, GA4 \`${id.versoes.ga4Version}\`.`,
        `- Hash das regras (catálogo, perguntas, pesos e motor): \`${id.hashes.rules}\`.`,
        `- Hash agregado da configuração: \`${id.hashes.aggregate}\`.`,
        `- Motor (\`src/engine-core.mjs\`): \`${id.hashes.engine}\`.`,
        `- Git: \`${id.git.branch}\` em \`${id.git.head}\`, com ${id.git.entradasAlteradasNoQuiz} entradas alteradas no quiz. Em \`src/\` e \`config/\`, ${id.git.alteracoesEmSrcEConfig.length} sem commit: o commit não identifica o motor avaliado, os hashes acima sim.`,
        `- Node ${id.node}. Fixture \`${id.arquivos.fixture}\`; avaliador \`${id.arquivos.avaliador}\`; script \`${id.arquivos.simulacao}\`.`,
        `- A identidade foi conferida no início e no fim da execução. Hash dos resultados: \`${relatorio.hashDosResultados}\`.`, '');

    push('## Limites', '',
        '- Perfis e expectativas são sintéticos, escritos antes da execução; o resultado não mede precisão com usuários reais.',
        '- O valor 400 é a opção "Sem limite definido": mede a afinidade sem restrição de preço, não a resposta realista de cada persona.',
        '- Esta etapa não alterou o recomendador. As regras apontadas acima são candidatas a revisão posterior.',
        '- Histórico do relatório: em 12/11/2026, depois da primeira execução, foram acrescentadas só três leituras dos mesmos dados: a margem pela diferença exata (o empate continua sendo o do índice arredondado), a verificação de dominância e a contagem dos casos das referências com uso presencial e o Max no orçamento. Respostas, expectativas, motor e invariantes não mudaram; o `resultado.json` da primeira execução foi sobrescrito.', '');

    push('## Reprodução', '', 'A partir de `quizSocio/`, com os mesmos hashes de motor e configuração:', '', '```sh',
        `node scripts/evaluate-reference.mjs --output docs/${pasta}/referencia-historical.json`,
        `node scripts/evaluate-reference.mjs --reference profiles --output docs/${pasta}/referencia-profiles.json`,
        `node scripts/simular-perfis.mjs --data ${data}`,
        'node --test tests/simulacao-perfis.test.mjs', '```', '');
    return linhas.join('\n');
}

async function main(args) {
    let data = hoje();
    while (args.length) {
        const flag = args.shift();
        if (flag !== '--data') throw new Error(`Argumento desconhecido: ${flag}`);
        data = args.shift();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(data ?? '')) throw new Error('--data exige AAAA-MM-DD.');
    }
    const pasta = path.join(projectRoot, 'docs/evidencias', `simulacao-19-perfis-${data}`);
    const arquivoMarkdown = path.join(projectRoot, 'docs', `simulacao-19-perfis-${data}.md`);

    const inicio = identidadeDaExecucao();
    const { fixture, sha256: fixtureSha } = carregarFixture();
    const problemas = validarFixture(fixture);
    if (problemas.length) throw new Error(`Pré-condições falharam; nenhuma recomendação foi calculada:\n- ${problemas.join('\n- ')}`);
    const referencias = resumirReferencias(pasta, inicio);

    const execucao = executar(fixture);
    const falhas = verificarInvariantes(fixture, execucao);
    if (falhas.length) throw new Error(`Invariantes falharam (defeito); nada foi gravado:\n- ${falhas.join('\n- ')}`);
    const diagnostico = diagnosticar(fixture, execucao);
    const fim = identidadeDaExecucao();
    if (hashCanonico(inicio) !== hashCanonico(fim)) throw new Error('A identidade do motor, da configuração ou dos arquivos mudou durante a execução; nada foi gravado.');

    const relatorio = {
        geradoEm: new Date().toISOString(), data, kind: 'synthetic-diagnostic-simulation', independentValidation: false,
        limitacao: fixture.metadata.limitacao,
        fixture: { arquivo: 'tests/fixtures/simulacao-19-perfis.json', sha256: fixtureSha, commit: FIXTURE_COMMIT },
        identidade: inicio,
        verificacoes: {
            preCondicoes: [
                'fixture idêntica ao congelamento (SHA-256)', '19 perfis distintos em 4 + 5 + 5 + 5',
                'três perfis próprios por grupo e migrações em 1 + 2 + 2 + 2',
                '12 respostas válidas e sem contradição nas 76 combinações', 'migrações coerentes com o perfil de origem',
                'configuração sem alterações pendentes', 'avaliações das 40 referências com a mesma identidade'
            ],
            invariantes: [
                'um único indicado por execução e nenhum acima do teto', 'mesmas entradas, mesma saída nas duas passadas',
                'mudar só o orçamento preserva índices e ordem dos elegíveis', 'indicado só muda por exclusão de orçamento',
                'R$ 200 idêntico ao orçamento sem limite', 'avaliador existente e motor com a mesma ordem',
                'identidade igual no início e no fim'
            ]
        },
        diagnostico, referencias, hashDosResultados: execucao.hash, resultados: execucao.resultados
    };
    fs.mkdirSync(pasta, { recursive: true });
    fs.writeFileSync(path.join(pasta, 'resultado.json'), JSON.stringify(relatorio, null, 2) + '\n');
    fs.writeFileSync(arquivoMarkdown, gerarMarkdown(relatorio));
    console.log(`Acertos com orçamento sem limite: ${diagnostico.acertos}/${diagnostico.total}.`);
    console.log(`Divergências: ${lista(diagnostico.perfis.filter((perfil) => !perfil.acerto).map((perfil) => perfil.id))}.`);
    console.log(`Relatório: ${path.relative(projectRoot, arquivoMarkdown)}; dados: ${path.relative(projectRoot, path.join(pasta, 'resultado.json'))}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main(process.argv.slice(2)).catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}
