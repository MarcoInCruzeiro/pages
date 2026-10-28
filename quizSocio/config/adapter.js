/** Configuração compartilhada por Node e Vite. Os JSONs são a fonte operacional. */
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import catalogo from './planos/catalogo.json' with { type: 'json' };
import catalogoSchema from './planos/catalogo.schema.json' with { type: 'json' };
import questoes from './questoes/questoes.json' with { type: 'json' };
import questoesSchema from './questoes/questoes.schema.json' with { type: 'json' };
import pesosRanking from './pesos/ranking.json' with { type: 'json' };
import pesosPerfil from './pesos/perfil.json' with { type: 'json' };
import pesosSchema from './pesos/pesos.schema.json' with { type: 'json' };
import ga4 from './ga4/ga4.json' with { type: 'json' };
import ga4Schema from './ga4/ga4.schema.json' with { type: 'json' };
import metadata from './revision.json' with { type: 'json' };

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(pesosSchema);
const validators = {
    catalogo: ajv.compile(catalogoSchema),
    questoes: ajv.compile(questoesSchema),
    pesosRanking: ajv.compile({ $ref: `${pesosSchema.$id}#/$defs/ranking` }),
    pesosPerfil: ajv.compile({ $ref: `${pesosSchema.$id}#/$defs/perfil` }),
    ga4: ajv.compile(ga4Schema)
};
const allowedValues = {
    wantsGuaranteedTicket: ['never', true, false], buysTwoTickets: [true, false],
    kidsCount: [0, 1, 2, 3], needsPriority: [true, false], wantsParticipation: [true, false],
    wantsStoreDiscount: [true, false], gameFrequency: ['always', 'frequent', 'occasional'],
    digitalExperience: [true, false], budget: [40, 100, 200, 400],
    preferredSector: ['yellow-orange', 'blue', 'purple']
};
const knownSectors = new Set(['amarelo-inferior', 'amarelo-superior', 'laranja-inferior', 'laranja-superior', 'sicoob-inferior', 'sicoob-superior', 'roxo-inferior', 'roxo-superior']);
const knownSlugs = ['meu-cruzeiro', 'time-do-povo', 'cabuloso', 'cabuloso-max'];
const fail = (domain, field, reason) => { throw new Error(`Configuração inválida [${domain}] ${field}: ${reason}`); };

export function carregarConfiguracao(dados, schema) {
    const validate = ajv.getSchema(schema.$id) || ajv.compile(schema);
    if (!validate(dados)) fail(schema.title || 'schema', '', ajv.errorsText(validate.errors, { dataVar: 'configuração' }));
    return dados;
}

export function validarSlugsUnicos(plans) {
    if (new Set(plans.map((p) => p.slug)).size !== plans.length) fail('catalogo', 'slug', 'slugs duplicados');
}

export function validarPrecosNaoNegativos(plans) {
    for (const plan of plans) {
        if (!Number.isFinite(plan.contratacao.precoMensalEquivalente) || plan.contratacao.precoMensalEquivalente < 0 || plan.contratacao.taxaAdesao < 0) fail('catalogo', plan.slug, 'preços precisam ser finitos e não negativos');
    }
}

export function validateConfiguration(configuration) {
    for (const [domain, validate] of Object.entries(validators)) {
        if (!validate(configuration?.[domain])) fail(domain, '', ajv.errorsText(validate.errors, { dataVar: domain }));
    }
    const { catalogo: plans, questoes: questions, pesosRanking: ranking, pesosPerfil: profile, ga4: analytics } = configuration;
    validarSlugsUnicos(plans);
    validarPrecosNaoNegativos(plans);
    if (knownSlugs.some((slug) => !plans.some((p) => p.slug === slug))) fail('catalogo', 'slug', 'os quatro planos ativos são obrigatórios');
    const keys = questions.map((q) => q.key);
    if (new Set(keys).size !== 12) fail('questoes', 'key', 'as 12 chaves devem ser únicas');
    for (const question of questions) {
        const expected = allowedValues[question.key];
        if (expected) {
            if (question.type !== 'option' || !Array.isArray(question.options) || question.options.length !== expected.length || expected.some((value) => question.options.filter((o) => Object.is(o.value, value)).length !== 1)) fail('questoes', question.key, 'tipo e valores semânticos das opções precisam ser preservados');
            if (question.allowUnknown) fail('questoes', question.key, 'desconhecido só é suportado no histórico');
        } else {
            if (question.type !== 'range' || question.min !== 0 || question.max <= question.min || !question.suffix) fail('questoes', question.key, 'faixa numérica inválida');
            if (question.key === 'gamesHistory' && (!question.allowUnknown || !question.unknownLabel)) fail('questoes', question.key, 'histórico deve permitir desconhecido');
            if (question.key === 'gamesPerYear' && question.allowUnknown) fail('questoes', question.key, 'intenção futura precisa de valor numérico');
        }
    }
    if (questions.find((q) => q.key === 'gamesPerYear').max !== profile.frecuencia.maxJogos) fail('perfil', 'frecuencia.maxJogos', 'deve corresponder ao máximo da pergunta de intenção');
    if (profile.frecuencia.volume + profile.frecuencia.presenca + profile.frecuencia.declaracao <= 0) fail('perfil', 'frecuencia', 'soma de pesos precisa ser positiva');
    if (ranking.priority.intervalo <= 0 || ranking.discount.referencia <= 0) fail('ranking', 'normalização', 'divisores precisam ser positivos');
    const minimumTotalWeight = ranking.presenca.base * (ranking.ticket.base + ranking.priority.base + Math.min(ranking.sector.comPreferencia, ranking.sector.semPreferencia)) + ranking.discount.base + ranking.experiences.base + Math.min(ranking.family.comFamilia, ranking.family.semFamilia) + ranking.price.base;
    if (minimumTotalWeight <= 0) fail('ranking', 'pesos', 'soma residual de pesos precisa ser positiva para todo perfil');
    if (ranking.family.capacidade + ranking.family.kids !== 1) fail('ranking', 'family', 'capacidade e Kids devem somar 1');
    if (profile.adultos.true !== 1 || profile.adultos.false !== 0 || profile.kids.max !== 3) fail('perfil', 'família', 'cardinalidades de adultos e Kids são parte do contrato');
    for (const plan of plans) {
        const c = plan.contratacao;
        const url = new URL(c.link);
        if (url.protocol !== 'https:' || url.hostname !== 'socio.cruzeiro.com.br' || url.username || url.password || url.port) fail('catalogo', `${plan.slug}.link`, 'destino de contratação não permitido');
        if (Number(url.searchParams.get('plano_id')) !== plan.id) fail('catalogo', `${plan.slug}.id`, 'identificador diverge do checkout');
        if (!c.modalidades.includes(url.searchParams.get('intervalo_cobrancas'))) fail('catalogo', `${plan.slug}.modalidades`, 'checkout deve usar modalidade publicada');
        if (c.precoMensal !== c.precoMensalEquivalente || c.valorParcela * c.parcelas !== (c.valorTotal ?? c.precoMensalEquivalente) || (c.modalidadePrincipal === 'anual' && c.valorTotal !== c.precoMensalEquivalente * 12)) fail('catalogo', `${plan.slug}.contratacao`, 'preço, parcelas e modalidade incoerentes');
        if (plan.ingresso.setores.some((sector) => !knownSectors.has(sector))) fail('catalogo', `${plan.slug}.setores`, 'setor desconhecido');
        if (new Set(plan.ingresso.setores).size !== plan.ingresso.setores.length) fail('catalogo', `${plan.slug}.setores`, 'setor duplicado');
        const levels = plan.ingresso.niveis;
        if (levels) {
            if (!levels.length || levels[0].jogosMinimos !== 0) fail('catalogo', `${plan.slug}.niveis`, 'níveis precisam iniciar em zero');
            levels.forEach((level, i) => {
                if (level.nivel !== i + 1 || (i < levels.length - 1 && (level.jogosMaximos === null || levels[i + 1].jogosMinimos !== level.jogosMaximos + 1)) || (i === levels.length - 1 && level.jogosMaximos !== null) || (level.jogosMaximos !== null && level.jogosMaximos < level.jogosMinimos)) fail('catalogo', `${plan.slug}.niveis`, 'níveis devem ser ordenados, contínuos e sem sobreposição');
            });
        }
        if (plan.ingresso.tipo === 'desconto' && plan.ingresso.descontoFixo === null && !levels) fail('catalogo', `${plan.slug}.desconto`, 'desconto precisa de percentual fixo ou níveis');
    }
    if (new Set(analytics.eventos.map((e) => e.chave)).size !== 4 || new Set(analytics.eventos.map((e) => e.nome)).size !== 4) fail('ga4', 'eventos', 'identidades e nomes precisam ser únicos');
    for (const host of analytics.ambientesHabilitados) {
        if (host !== host.toLowerCase() || /[/:*]/.test(host)) fail('ga4', 'ambientesHabilitados', 'use hostname exato e normalizado');
    }
    const requiredFields = {
        quiz_start: [],
        quiz_answer: ['quiz_step', 'quiz_question', 'quiz_answer', 'quiz_answer_label', 'answer_time_sec'],
        quiz_complete: ['recommended_plan', 'affinity_index', 'compatibility', 'score_semantics', 'no_eligible_plan', 'catalog_version', 'rules_version', 'total_time_sec', 'answer_*'],
        quiz_subscribe_click: ['plan', 'recommended_plan', 'clicked_recommended', 'cta_location']
    };
    for (const event of analytics.eventos) {
        if (requiredFields[event.chave].some((field) => !event.camposPrincipais.includes(field))) fail('ga4', event.chave, 'campos obrigatórios do contrato ausentes; alteração exige migração explícita');
        if (Object.keys(event.tipos).length !== event.camposPrincipais.length || event.camposPrincipais.some((field) => !Object.hasOwn(event.tipos, field))) fail('ga4', event.chave, 'todos os campos precisam de uma definição de tipo correspondente');
        const fields = event.camposPrincipais.flatMap((field) => field === 'answer_*' ? keys.map((key) => `answer_${key}`) : [field]);
        if (new Set(fields).size !== fields.length || fields.length > analytics.limiteParametrosPersonalizados) fail('ga4', event.chave, 'payload excede teto interno ou contém campos duplicados');
        if (event.chave === 'quiz_complete' && !fields.includes('rules_version')) fail('ga4', event.chave, 'rules_version é obrigatório; remoção exige migração explícita');
        if (fields.some((field) => !/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(field))) fail('ga4', event.chave, 'nome de parâmetro inválido');
    }
    return configuration;
}

export function carregarTodaConfiguracao() {
    return validateConfiguration(structuredClone({ catalogo, questoes, pesosRanking, pesosPerfil, ga4, metadata }));
}
export const converterCatalogoParaMotor = (plans) => structuredClone(plans);
export const converterQuestoesParaMotor = (questions) => structuredClone(questions);
