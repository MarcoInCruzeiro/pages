/*
 * Referência sintética criada pelo agente por autorização do usuário em
 * 27/10/2026 (QUIZ-009). Expectativas vêm das necessidades descritas e do
 * catálogo aceito, sem consultar recommendPlans na elaboração deste arquivo.
 * Não representa validação externa ou amostra de usuários reais.
 * Avaliação do ranking e eventual ajuste pertencem ao QUIZ-010-A.
 */
const base = {
    gamesPerYear: 0,
    gamesHistory: 'unknown',
    wantsGuaranteedTicket: 'never',
    buysTwoTickets: false,
    kidsCount: 0,
    needsPriority: false,
    wantsParticipation: false,
    wantsStoreDiscount: false,
    gameFrequency: 'occasional',
    digitalExperience: false,
    budget: 40,
    preferredSector: 'yellow-orange'
};

const profiles = [
    {
        id: 'apoio-economico', name: 'Apoio ao clube sem presença no estádio',
        answers: {}, validationChanges: { preferredSector: 'purple' },
        acceptable: ['meu-cruzeiro'],
        expectedNeeds: { attendance: 'none', adults: 0, kids: 0 },
        reason: 'Sem uso presencial e sem interesse declarado em extras, a assinatura de menor valor atende ao apoio ao clube; setor não deve decidir.'
    },
    {
        id: 'popular-frequente', name: 'Presença frequente com orçamento popular',
        answers: { gamesPerYear: 20, gamesHistory: 9, wantsGuaranteedTicket: false, gameFrequency: 'frequent' },
        validationChanges: { gamesPerYear: 27, gameFrequency: 'always' },
        acceptable: ['time-do-povo'],
        expectedNeeds: { attendance: 'positive', adults: 0, kids: 0 },
        reason: 'Com frequência elevada, teto de assinatura de R$ 40 e setor popular, o ingresso popular por jogo é mais adequado que um ingresso por temporada.'
    },
    {
        id: 'titular-progressivo', name: 'Titular com histórico e interesse em benefícios',
        answers: { gamesPerYear: 16, gamesHistory: 10, wantsGuaranteedTicket: false, needsPriority: true, wantsParticipation: true, wantsStoreDiscount: true, gameFrequency: 'frequent', digitalExperience: true, budget: 100, preferredSector: 'blue' },
        validationChanges: { gamesPerYear: 22, gamesHistory: 20 },
        acceptable: ['cabuloso'],
        expectedNeeds: { attendance: 'positive', adults: 0, kids: 0 },
        reason: 'Uso frequente no Sicoob, desconto progressivo e prioridade atual justificam Cabuloso dentro de R$ 100, sem conceder nível pela intenção futura.'
    },
    {
        id: 'casal-roxo', name: 'Dois adultos com preferência pelo Roxo',
        answers: { gamesPerYear: 18, wantsGuaranteedTicket: true, buysTwoTickets: true, needsPriority: true, wantsParticipation: true, wantsStoreDiscount: true, gameFrequency: 'always', budget: 200, preferredSector: 'purple' },
        validationChanges: { gamesPerYear: 30, gamesHistory: 30 },
        acceptable: ['cabuloso-max'],
        expectedNeeds: { attendance: 'positive', adults: 1, kids: 0 },
        reason: 'Dois ingressos com desconto e cobertura de Roxo inferior e superior sustentam Max; assinatura e despesas do acompanhante continuam separadas.'
    },
    {
        id: 'presenca-sicoob', name: 'Presença intensa e prioridade no Sicoob',
        answers: { gamesPerYear: 30, gamesHistory: 20, wantsGuaranteedTicket: true, needsPriority: true, gameFrequency: 'always', budget: 400, preferredSector: 'blue' },
        validationChanges: { gamesPerYear: 26, gamesHistory: 30 },
        acceptable: ['cabuloso-cativo', 'cabuloso-max', 'cabuloso'],
        expectedNeeds: { attendance: 'positive', adults: 0, kids: 0 },
        reason: 'A declaração expressa desejo de presença, não uma restrição obrigatória de garantia; garantia do Cativo e descontos com prioridade de Max/Cabuloso são alternativas aceitáveis.'
    },
    {
        id: 'familia-kids', name: 'Um adulto e três crianças no setor popular',
        answers: { gamesPerYear: 16, wantsGuaranteedTicket: false, kidsCount: 3, gameFrequency: 'frequent', budget: 100 },
        validationChanges: { gamesPerYear: 24, gamesHistory: 15 },
        acceptable: ['time-do-povo', 'cabuloso'],
        expectedNeeds: { attendance: 'positive', adults: 0, kids: 3 },
        reason: 'Presença recorrente e Kids elegível admitem benefício popular ou desconto progressivo; o teto limita só a assinatura e o opcional é exposto por criança.'
    },
    {
        id: 'loja-digital', name: 'Conteúdo e produtos oficiais sem uso de estádio',
        answers: { wantsParticipation: true, wantsStoreDiscount: true, digitalExperience: true, budget: 100, preferredSector: 'blue' },
        validationChanges: { preferredSector: 'purple', gamesHistory: 20 },
        acceptable: ['meu-cruzeiro', 'cabuloso'],
        expectedNeeds: { attendance: 'none', adults: 0, kids: 0 },
        reason: 'Conteúdo e apoio econômico admitem Meu Cruzeiro; o maior desconto de loja pode justificar Cabuloso. Histórico e conteúdo digital não criam necessidade presencial.'
    },
    {
        id: 'roxo-orcamento-limitado', name: 'Preferência por Roxo com teto intermediário',
        answers: { gamesPerYear: 15, gamesHistory: 9, wantsGuaranteedTicket: false, needsPriority: true, gameFrequency: 'frequent', budget: 100, preferredSector: 'purple' },
        validationChanges: { gamesPerYear: 21, gamesHistory: 10 },
        acceptable: ['cabuloso'],
        expectedNeeds: { attendance: 'positive', adults: 0, kids: 0 },
        reason: 'Cabuloso oferece desconto no Roxo Superior dentro do teto, com cobertura parcial explícita; preferir Roxo não autoriza recomendar Max acima do orçamento.'
    }
];

const scenarios = profiles.flatMap((profile, index) => ['calibracao', 'validacao'].map((split) => ({
    id: `PER-${String(index + 1).padStart(2, '0')}-${split === 'calibracao' ? 'C' : 'V'}`,
    profileId: profile.id, split,
    answers: { ...base, ...profile.answers, ...(split === 'validacao' ? profile.validationChanges : {}) },
    acceptable: profile.acceptable.slice(), reason: profile.reason,
    expectedNeeds: { ...profile.expectedNeeds }
})));

module.exports = { base, profiles, scenarios };
