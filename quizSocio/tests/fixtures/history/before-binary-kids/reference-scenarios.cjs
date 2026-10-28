/*
 * Base sintética de referência do QUIZ-009.
 *
 * Cada cenário registra respostas completas, planos aceitáveis e o motivo.
 * Os rótulos `calibracao` e `reserva` preservam a partição histórica, mas ambos
 * os conjuntos já foram consultados e hoje servem como regressão sintética.
 * A situação da avaliação independente está em reference-provenance.json.
 * Não há vencedor obrigatório: mais de um plano pode ser aceitável.
 * `contradicao` reúne respostas incompatíveis: elas devem ser detectadas e
 * confirmadas pelo usuário, e não entram nas métricas de recomendação.
 *
 * Restrições comuns a todos os cenários válidos: o teto de `budget` limita a
 * assinatura (tolerância zero de violação) e o setor é preferência flexível
 * (diferença visível, sem eliminar o plano). Os valores de ingresso são as
 * premissas abaixo, as mesmas do motor; não são preços oficiais. A ADR-0001
 * mantém valores separados e usa apenas a assinatura no componente de preço.
 */
const premissas = {
    precoIngressoCheio: 150
};

// `wantsGuaranteedTicket: false` é coerente com qualquer quantidade de jogos;
// cenários de zero jogos declaram `never` explicitamente.
const base = {
    gamesPerYear: 0,
    gamesHistory: 'unknown',
    wantsGuaranteedTicket: false,
    buysTwoTickets: false,
    kidsCount: 0,
    needsPriority: false,
    wantsParticipation: false,
    wantsStoreDiscount: false,
    gameFrequency: 'occasional',
    digitalExperience: false,
    budget: 400,
    preferredSector: 'yellow-orange'
};

const scenarios = [
    // ---------------------------------------------------------------- calibração
    {
        id: 'CAL-01',
        split: 'calibracao',
        category: 'zero jogos com conteúdo',
        answers: { ...base, gamesPerYear: 0, wantsGuaranteedTicket: 'never', wantsParticipation: true, wantsStoreDiscount: true, budget: 400, preferredSector: 'blue' },
        acceptable: ['cabuloso', 'meu-cruzeiro'],
        reason: 'Sem jogos, o benefício de ingresso é secundário; conteúdo e desconto de loja sustentam Cabuloso ou Meu Cruzeiro.'
    },
    {
        id: 'CAL-02',
        split: 'calibracao',
        category: 'orçamento 40 e setor popular',
        answers: { ...base, gamesPerYear: 10, gamesHistory: 5, wantsGuaranteedTicket: false, gameFrequency: 'occasional', budget: 40, preferredSector: 'yellow-orange' },
        acceptable: ['time-do-povo'],
        reason: 'Com 10 jogos e teto de assinatura de R$ 40, o ingresso popular do Time do Povo atende ao uso e ao setor.'
    },
    {
        id: 'CAL-03',
        split: 'calibracao',
        category: 'loja e conteúdo',
        answers: { ...base, gamesPerYear: 8, gamesHistory: 5, gameFrequency: 'frequent', wantsParticipation: true, wantsStoreDiscount: true, digitalExperience: true, budget: 100, preferredSector: 'blue' },
        acceptable: ['cabuloso'],
        reason: 'Quem quer desconto de loja e conteúdo encontra no Cabuloso o maior desconto confirmado dentro de R$ 100.'
    },
    {
        id: 'CAL-04',
        split: 'calibracao',
        category: 'alta frequência no Sicoob',
        answers: { ...base, gamesPerYear: 30, gamesHistory: 25, wantsGuaranteedTicket: true, needsPriority: true, wantsParticipation: true, wantsStoreDiscount: true, gameFrequency: 'always', digitalExperience: true, budget: 400, preferredSector: 'blue' },
        acceptable: ['cabuloso', 'cabuloso-cativo', 'cabuloso-max'],
        reason: 'Alta frequência e orçamento amplo admitem desconto progressivo, dois ingressos ou garantia no Sicoob.'
    },
    {
        id: 'CAL-05',
        split: 'calibracao',
        category: 'casal no Roxo',
        answers: { ...base, gamesPerYear: 20, gamesHistory: 25, wantsGuaranteedTicket: true, buysTwoTickets: true, needsPriority: true, wantsParticipation: true, gameFrequency: 'always', digitalExperience: true, budget: 400, preferredSector: 'purple' },
        acceptable: ['cabuloso-max'],
        reason: 'Casal no Roxo exige cobertura do setor e capacidade para dois ingressos; o Max atende ambos.'
    },
    {
        id: 'CAL-06',
        split: 'calibracao',
        category: 'casal com dois Kids',
        answers: { ...base, gamesPerYear: 20, gamesHistory: 15, wantsGuaranteedTicket: true, buysTwoTickets: true, kidsCount: 2, needsPriority: true, wantsParticipation: true, wantsStoreDiscount: true, gameFrequency: 'always', digitalExperience: true, budget: 200, preferredSector: 'yellow-orange' },
        acceptable: ['cabuloso-max', 'cabuloso'],
        reason: 'Dois adultos e duas crianças no Amarelo/Laranja admitem Max (dois ingressos) ou Cabuloso com Kids.'
    },
    {
        id: 'CAL-07',
        split: 'calibracao',
        category: 'histórico nível 3',
        answers: { ...base, gamesPerYear: 10, gamesHistory: 25, gameFrequency: 'occasional', wantsParticipation: true, budget: 100, preferredSector: 'blue' },
        acceptable: ['cabuloso'],
        reason: 'Histórico de 25 jogos confirma nível 3 e o maior desconto do Cabuloso.'
    },
    {
        id: 'CAL-08',
        split: 'calibracao',
        category: 'histórico nível 1',
        answers: { ...base, gamesPerYear: 10, gamesHistory: 5, gameFrequency: 'occasional', wantsParticipation: true, budget: 100, preferredSector: 'blue' },
        acceptable: ['cabuloso'],
        reason: 'Mesmo plano do CAL-07, mas com histórico de nível 1: o benefício atual é menor.'
    },
    {
        id: 'CAL-09',
        split: 'calibracao',
        category: 'novo sócio',
        answers: { ...base, gamesPerYear: 15, gamesHistory: 'unknown', wantsGuaranteedTicket: true, needsPriority: true, wantsParticipation: true, wantsStoreDiscount: true, gameFrequency: 'always', digitalExperience: true, budget: 400, preferredSector: 'blue' },
        acceptable: ['cabuloso', 'cabuloso-max', 'cabuloso-cativo'],
        reason: 'Sem histórico confirmado, aplica-se o nível 1 inicial; planos com benefício fixo também são aceitáveis.'
    },
    {
        id: 'CAL-10',
        split: 'calibracao',
        category: 'Roxo com teto de 200',
        answers: { ...base, gamesPerYear: 15, gamesHistory: 15, gameFrequency: 'frequent', wantsParticipation: true, wantsStoreDiscount: true, digitalExperience: true, budget: 200, preferredSector: 'purple' },
        acceptable: ['cabuloso-max'],
        reason: 'O Max é o único até R$ 200 que cobre Roxo inferior e superior.'
    },
    {
        id: 'CAL-11',
        split: 'calibracao',
        category: 'acompanhante adulto',
        answers: { ...base, gamesPerYear: 12, gamesHistory: 10, wantsGuaranteedTicket: true, buysTwoTickets: true, needsPriority: true, gameFrequency: 'frequent', budget: 100, preferredSector: 'yellow-orange' },
        acceptable: ['cabuloso'],
        reason: 'Com teto de R$ 100 e acompanhante, o desconto do Cabuloso é a opção viável no setor.'
    },
    {
        id: 'CAL-12',
        split: 'calibracao',
        category: 'baixa frequência e teto 40',
        answers: { ...base, gamesPerYear: 5, gamesHistory: 0, gameFrequency: 'occasional', budget: 40, preferredSector: 'yellow-orange' },
        acceptable: ['time-do-povo', 'meu-cruzeiro'],
        reason: 'Com poucos jogos e teto de R$ 40, o ingresso popular ou o ingresso gratuito anual podem ser suficientes.'
    },

    // ------------------------------------------------------------------ reserva
    {
        id: 'RES-01',
        split: 'reserva',
        category: 'zero jogos sem extras',
        answers: { ...base, gamesPerYear: 0, wantsGuaranteedTicket: 'never', gameFrequency: 'occasional', budget: 40, preferredSector: 'yellow-orange' },
        acceptable: ['meu-cruzeiro'],
        reason: 'Sem jogos e sem interesse em extras, o menor custo de assinatura é o critério dominante.'
    },
    {
        id: 'RES-02',
        split: 'reserva',
        category: 'zero jogos com loja',
        answers: { ...base, gamesPerYear: 0, wantsGuaranteedTicket: 'never', wantsStoreDiscount: true, gameFrequency: 'occasional', budget: 100, preferredSector: 'blue' },
        acceptable: ['cabuloso', 'meu-cruzeiro'],
        reason: 'Sem jogos, o desconto de loja e o custo definem; Cabuloso tem 15%, Meu Cruzeiro é mais barato.'
    },
    {
        id: 'RES-03',
        split: 'reserva',
        category: 'alta frequência no Amarelo',
        answers: { ...base, gamesPerYear: 30, gamesHistory: 20, wantsGuaranteedTicket: true, needsPriority: true, wantsParticipation: true, gameFrequency: 'always', budget: 100, preferredSector: 'yellow-orange' },
        acceptable: ['cabuloso', 'time-do-povo'],
        reason: 'No Amarelo, o desconto progressivo do Cabuloso e o ingresso popular do Time do Povo são alternativas coerentes.'
    },
    {
        id: 'RES-04',
        split: 'reserva',
        category: 'alta frequência com teto 40',
        answers: { ...base, gamesPerYear: 30, gamesHistory: 20, wantsGuaranteedTicket: true, gameFrequency: 'always', budget: 40, preferredSector: 'yellow-orange' },
        acceptable: ['time-do-povo'],
        reason: 'Com trinta jogos e teto de R$ 40, o ingresso popular é o único benefício compatível com o uso.'
    },
    {
        id: 'RES-05',
        split: 'reserva',
        category: 'Roxo sem cobertura do Cativo',
        answers: { ...base, gamesPerYear: 10, gamesHistory: 20, wantsGuaranteedTicket: true, wantsParticipation: true, digitalExperience: true, gameFrequency: 'frequent', budget: 400, preferredSector: 'purple' },
        acceptable: ['cabuloso-max'],
        reason: 'O Cativo cobre apenas Sicoob Leste Inferior; para Roxo, o Max é a alternativa compatível.'
    },
    {
        id: 'RES-06',
        split: 'reserva',
        category: 'garantia no Sicoob',
        answers: { ...base, gamesPerYear: 20, gamesHistory: 20, wantsGuaranteedTicket: true, needsPriority: true, wantsParticipation: true, wantsStoreDiscount: true, gameFrequency: 'always', digitalExperience: true, budget: 400, preferredSector: 'blue' },
        acceptable: ['cabuloso', 'cabuloso-cativo', 'cabuloso-max'],
        reason: 'No Sicoob, o Cativo garante o ingresso; Cabuloso e Max oferecem desconto e prioridade.'
    },
    {
        id: 'RES-07',
        split: 'reserva',
        category: 'um Kids com teto 100',
        answers: { ...base, gamesPerYear: 12, gamesHistory: 10, wantsGuaranteedTicket: true, buysTwoTickets: true, kidsCount: 1, needsPriority: true, wantsParticipation: true, wantsStoreDiscount: true, gameFrequency: 'frequent', digitalExperience: true, budget: 100, preferredSector: 'yellow-orange' },
        acceptable: ['cabuloso'],
        reason: 'Com teto de R$ 100, um adulto acompanhante e um Kids, o Cabuloso é o plano viável no setor.'
    },
    {
        id: 'RES-08',
        split: 'reserva',
        category: 'casal no Roxo com teto 200',
        answers: { ...base, gamesPerYear: 15, gamesHistory: 15, wantsGuaranteedTicket: true, buysTwoTickets: true, needsPriority: true, wantsParticipation: true, gameFrequency: 'frequent', digitalExperience: true, budget: 200, preferredSector: 'purple' },
        acceptable: ['cabuloso-max'],
        reason: 'Casal no Roxo e teto de R$ 200 apontam para o Max.'
    },
    {
        id: 'RES-09',
        split: 'reserva',
        category: 'limite de nível 10 jogos',
        answers: { ...base, gamesPerYear: 10, gamesHistory: 10, gameFrequency: 'occasional', wantsParticipation: true, budget: 100, preferredSector: 'blue' },
        acceptable: ['cabuloso'],
        reason: 'Dez jogos históricos colocam o Cabuloso no nível 2.'
    },
    {
        id: 'RES-10',
        split: 'reserva',
        category: 'limite de nível 20 jogos',
        answers: { ...base, gamesPerYear: 10, gamesHistory: 20, gameFrequency: 'occasional', wantsParticipation: true, budget: 100, preferredSector: 'blue' },
        acceptable: ['cabuloso'],
        reason: 'Vinte jogos históricos colocam o Cabuloso no nível 3.'
    },
    {
        id: 'RES-11',
        split: 'reserva',
        category: 'teto 40 no Sicoob',
        answers: { ...base, gamesPerYear: 8, gamesHistory: 0, gameFrequency: 'occasional', budget: 40, preferredSector: 'blue' },
        acceptable: ['time-do-povo'],
        reason: 'Com teto de R$ 40, o Time do Povo é o único com benefício de ingresso por jogo; o setor preferido fica sinalizado como não coberto.'
    },
    {
        id: 'RES-12',
        split: 'reserva',
        category: 'premium com família',
        answers: { ...base, gamesPerYear: 30, gamesHistory: 30, wantsGuaranteedTicket: true, buysTwoTickets: true, kidsCount: 3, needsPriority: true, wantsParticipation: true, wantsStoreDiscount: true, gameFrequency: 'always', digitalExperience: true, budget: 400, preferredSector: 'purple' },
        acceptable: ['cabuloso-max'],
        reason: 'Casal, três Kids e preferência por Roxo exigem capacidade de dois ingressos e cobertura do setor.'
    },

    // -------------------------------------------------------------- contradição
    {
        id: 'CON-01',
        split: 'contradicao',
        category: 'zero jogos e presença em todos',
        answers: { ...base, gamesPerYear: 0, wantsGuaranteedTicket: true, gameFrequency: 'occasional', budget: 100, preferredSector: 'blue' },
        expectedConflicts: [['gamesPerYear', 'wantsGuaranteedTicket']],
        acceptable: [],
        reason: 'Zero jogos contradiz “faço questão de ir a todos os jogos”; o resultado só aparece após confirmação ou revisão.'
    },
    {
        id: 'CON-02',
        split: 'contradicao',
        category: 'zero jogos e sempre na arquibancada',
        answers: { ...base, gamesPerYear: 0, wantsGuaranteedTicket: false, gameFrequency: 'always', budget: 200, preferredSector: 'yellow-orange' },
        expectedConflicts: [['gamesPerYear', 'gameFrequency']],
        acceptable: [],
        reason: 'Zero jogos contradiz “sempre na arquibancada”; a intenção anual só define o volume depois da confirmação.'
    },
    {
        id: 'CON-03',
        split: 'contradicao',
        category: 'zero jogos e dividido entre estádio e TV',
        answers: { ...base, gamesPerYear: 0, wantsGuaranteedTicket: false, gameFrequency: 'frequent', budget: 40, preferredSector: 'yellow-orange' },
        expectedConflicts: [['gamesPerYear', 'gameFrequency']],
        acceptable: [],
        reason: 'Zero jogos contradiz “vou em boa parte dos jogos”; a combinação precisa de confirmação explícita.'
    },
    {
        id: 'CON-04',
        split: 'contradicao',
        category: 'jogos previstos e não frequenta',
        answers: { ...base, gamesPerYear: 12, gamesHistory: 5, wantsGuaranteedTicket: 'never', gameFrequency: 'occasional', budget: 100, preferredSector: 'blue' },
        expectedConflicts: [['gamesPerYear', 'wantsGuaranteedTicket']],
        acceptable: [],
        reason: 'Doze jogos previstos contradizem “não frequento o estádio”; confirmada, a declaração zera a necessidade presencial.'
    },
    {
        id: 'CON-05',
        split: 'contradicao',
        category: 'dupla contradição',
        answers: { ...base, gamesPerYear: 0, wantsGuaranteedTicket: true, gameFrequency: 'always', budget: 400, preferredSector: 'purple' },
        expectedConflicts: [['gamesPerYear', 'wantsGuaranteedTicket'], ['gamesPerYear', 'gameFrequency']],
        acceptable: [],
        reason: 'Duas respostas contradizem zero jogos; ambas aparecem na revisão antes do resultado.'
    }
];

module.exports = { premissas, base, scenarios };
