const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../quiz-engine.js');

const fullAnswers = {
    gamesPerYear: 15,
    gamesHistory: 'unknown',
    wantsGuaranteedTicket: true,
    buysTwoTickets: false,
    kidsCount: 0,
    needsPriority: true,
    wantsParticipation: true,
    wantsStoreDiscount: true,
    gameFrequency: 'always',
    digitalExperience: true,
    budget: 400,
    preferredSector: 'blue'
};

test('catálogo concilia os cinco planos com o regulamento', () => {
    const tdp = engine.assinaturasSocios.timeDoPovo;
    assert.equal(tdp.loja.percentual, 0.10);
    assert.equal(tdp.prioridade, 4);
    assert.equal(tdp.conteudoExclusivo, true);
    assert.equal(tdp.votacao, true);
    assert.equal(tdp.ingresso.tipo, 'popular');
    assert.equal(tdp.ingresso.quantidade, 1);
    assert.deepEqual(tdp.ingresso.setores, [
        'amarelo-inferior', 'amarelo-superior', 'laranja-inferior', 'laranja-superior'
    ]);
    assert.equal(tdp.contratacao.taxaAdesao, 30);
    assert.deepEqual(tdp.contratacao.modalidades, ['semestral', 'anual']);
    assert.match(engine.getPlanContract(tdp).totalText, /Total anual: R\$\s*480,00/);
    assert.match(engine.getPlanContract(tdp).detail, /semestral ou anual/);

    const cativo = engine.assinaturasSocios.cabulosoCativo;
    assert.deepEqual(cativo.contratacao.modalidades, ['anual']);
    assert.equal(cativo.contratacao.valorTotal, 4800);
    assert.equal(cativo.contratacao.parcelas, 12);
    assert.equal(cativo.contratacao.valorParcela, 400);
    assert.deepEqual(cativo.ingresso.setores, ['sicoob-inferior']);
    assert.equal(cativo.garantiaIngresso, true);
    assert.equal(cativo.contratacao.link.includes('intervalo_cobrancas=anual'), true);

    engine.plans.forEach((plan) => {
        assert.equal(plan.contratacao.link.includes('intervalo_cobrancas=anual'), true, plan.slug);
    });

    assert.deepEqual(cativo.camposPendentes, ['descontoEmParceiros', 'disponibilidadeCativo']);
    assert.equal(engine.CATALOG_SOURCE.consulta, '2026-10-26');
});

test('exemplo de desconto do Max respeita 65% de R$ 150', () => {
    const max = engine.assinaturasSocios.cabulosoMax;
    const benefit = engine.getTicketBenefit(max, fullAnswers);
    assert.match(benefit.text, /R\$ 52,50/);
    assert.equal(Number((150 * 0.35).toFixed(2)), 52.5);
});

test('validação aceita zero e false e rejeita ausentes ou inválidos', () => {
    const games = engine.QUESTION_BY_KEY.gamesPerYear;
    const history = engine.QUESTION_BY_KEY.gamesHistory;
    const presence = engine.QUESTION_BY_KEY.wantsGuaranteedTicket;

    assert.equal(engine.isAnswerValid(games, 0), true);
    assert.equal(engine.isAnswerValid(games, 30), true);
    assert.equal(engine.isAnswerValid(games, 31), false);
    assert.equal(engine.isAnswerValid(games, null), false);
    assert.equal(engine.isAnswerValid(history, 'unknown'), true);
    assert.equal(engine.isAnswerValid(presence, false), true);
    assert.equal(engine.isAnswerValid(presence, null), false);
    assert.equal(engine.isAnswerValid(presence, undefined), false);
    assert.equal(engine.isAnswerValid(games, undefined), false);
    assert.equal(engine.isAnswerValid(presence, 'false'), false);
});

test('validação aponta a primeira pergunta sem resposta', () => {
    const answers = engine.createInitialAnswers();
    answers.gamesPerYear = 10;
    answers.wantsGuaranteedTicket = true;
    const invalid = engine.validateAnswers(answers);
    assert.equal(invalid[0].key, 'buysTwoTickets');
    assert.equal(invalid.length, 9);
});

test('conteúdo digital não acrescenta frequência nem consumo de produtos', () => {
    const withoutDigital = engine.buildUserProfile({ ...fullAnswers, digitalExperience: false });
    const withDigital = engine.buildUserProfile({ ...fullAnswers, digitalExperience: true });
    assert.equal(withoutDigital.frecuencia, withDigital.frecuencia);
    assert.equal(withoutDigital.productos, withDigital.productos);
    assert.ok(withDigital.experiencias > withoutDigital.experiencias);
});

test('frequência declarada não implica interesse em produtos ou experiências', () => {
    const occasional = engine.buildUserProfile({
        ...fullAnswers,
        wantsParticipation: false,
        wantsStoreDiscount: false,
        digitalExperience: false,
        gameFrequency: 'occasional'
    });
    const always = engine.buildUserProfile({
        ...fullAnswers,
        wantsParticipation: false,
        wantsStoreDiscount: false,
        digitalExperience: false,
        gameFrequency: 'always'
    });
    assert.ok(always.frecuencia > occasional.frecuencia);
    assert.equal(always.productos, occasional.productos);
    assert.equal(always.experiencias, occasional.experiencias);
});

test('zero jogos ou não frequentar resultam em necessidade presencial nula', () => {
    const zero = engine.buildUserProfile({ ...fullAnswers, gamesPerYear: 0, wantsGuaranteedTicket: true });
    const never = engine.buildUserProfile({ ...fullAnswers, gamesPerYear: 15, wantsGuaranteedTicket: 'never' });
    assert.equal(zero.frecuencia, 0);
    assert.equal(never.frecuencia, 0);
});

test('contradições são detectadas sem correção silenciosa', () => {
    const zeroAlways = engine.detectConflicts({
        ...fullAnswers,
        gamesPerYear: 0,
        wantsGuaranteedTicket: true,
        gameFrequency: 'always'
    });
    assert.equal(zeroAlways.length, 2);
    assert.deepEqual(zeroAlways.map((item) => item.firstKey), ['gamesPerYear', 'gamesPerYear']);

    const zeroNever = engine.detectConflicts({
        ...fullAnswers,
        gamesPerYear: 0,
        wantsGuaranteedTicket: 'never',
        gameFrequency: 'occasional'
    });
    assert.equal(zeroNever.length, 0);

    const gamesNever = engine.detectConflicts({
        ...fullAnswers,
        gamesPerYear: 10,
        wantsGuaranteedTicket: 'never',
        gameFrequency: 'occasional'
    });
    assert.equal(gamesNever.length, 1);
});

test('níveis do Cabuloso usam histórico e seguem os limites oficiais', () => {
    const plan = engine.assinaturasSocios.cabuloso;
    const cases = [
        [0, 1], [9, 1], [10, 2], [19, 2], [20, 3], [30, 3]
    ];
    cases.forEach(([history, expected]) => {
        const level = engine.resolveLevel(plan, { ...fullAnswers, gamesHistory: history });
        assert.equal(level.nivel, expected, `histórico ${history}`);
        assert.equal(level.origem, 'historico');
    });

    const unknown = engine.resolveLevel(plan, { ...fullAnswers, gamesHistory: 'unknown' });
    assert.equal(unknown.nivel, 1);
    assert.equal(unknown.origem, 'inicial');

    const changedIntention = engine.resolveLevel(plan, { ...fullAnswers, gamesHistory: 5, gamesPerYear: 30 });
    assert.equal(changedIntention.nivel, 1);
});

test('desconto e prioridade derivam do mesmo nível', () => {
    const plan = engine.assinaturasSocios.cabuloso;
    const level3 = { ...fullAnswers, gamesHistory: 25 };
    assert.equal(engine.getDiscount(plan, level3), 0.60);
    assert.equal(engine.getPriority(plan, level3).value, 1);

    const level1 = { ...fullAnswers, gamesHistory: 5 };
    assert.equal(engine.getDiscount(plan, level1), 0.50);
    assert.equal(engine.getPriority(plan, level1).value, 3);
});

test('cobertura de setor distingue completo, parcial e ausente', () => {
    const cativo = engine.assinaturasSocios.cabulosoCativo;
    const max = engine.assinaturasSocios.cabulosoMax;
    const cabuloso = engine.assinaturasSocios.cabuloso;
    const tdp = engine.assinaturasSocios.timeDoPovo;

    assert.equal(engine.getSectorFit(cativo, { ...fullAnswers, preferredSector: 'blue' }).level, 'partial');
    assert.equal(engine.getSectorFit(cativo, { ...fullAnswers, preferredSector: 'purple' }).level, 'none');
    assert.equal(engine.getSectorFit(max, { ...fullAnswers, preferredSector: 'purple' }).level, 'full');
    assert.equal(engine.getSectorFit(cabuloso, { ...fullAnswers, preferredSector: 'purple' }).level, 'partial');
    assert.equal(engine.getSectorFit(tdp, { ...fullAnswers, preferredSector: 'yellow-orange' }).level, 'full');
});

test('preferência pelo Roxo não apresenta o Cativo como benefício no setor', () => {
    const result = engine.recommendPlans({ ...fullAnswers, preferredSector: 'purple' });
    const cativo = result.all.find((item) => item.plan.slug === 'cabuloso-cativo');
    assert.equal(cativo.sectorFit.level, 'none');
    assert.equal(result.winner.plan.slug, 'cabuloso-max');
    assert.ok(result.winner.reasons.some((reason) => /Roxo|setor/i.test(reason)) === false);
});

test('custo separa assinatura, adesão, Kids e ingressos', () => {
    const cativo = engine.getPlanCost(engine.assinaturasSocios.cabulosoCativo, {
        ...fullAnswers,
        gamesPerYear: 20,
        buysTwoTickets: false
    });
    assert.equal(cativo.subscription, 400);
    assert.equal(cativo.ticketsMonthly, 0);
    assert.equal(cativo.adhesion, 0);
    assert.equal(cativo.estimatedMonthly, 400);

    const tdp = engine.getPlanCost(engine.assinaturasSocios.timeDoPovo, {
        ...fullAnswers,
        gamesPerYear: 12,
        buysTwoTickets: false
    });
    assert.equal(tdp.subscription, 40);
    assert.equal(tdp.adhesion, 30);
    assert.equal(tdp.firstMonth, tdp.estimatedMonthly + 30);
    assert.equal(tdp.extraAdultTicket, 0);

    const tdpWithAdult = engine.getPlanCost(engine.assinaturasSocios.timeDoPovo, {
        ...fullAnswers,
        gamesPerYear: 12,
        buysTwoTickets: true
    });
    assert.equal(tdpWithAdult.extraAdultTicket, 150);

    const maxWithAdult = engine.getPlanCost(engine.assinaturasSocios.cabulosoMax, {
        ...fullAnswers,
        gamesPerYear: 12,
        buysTwoTickets: true
    });
    assert.equal(maxWithAdult.extraAdultTicket, 0);

    const withKids = engine.getPlanCost(engine.assinaturasSocios.cabuloso, {
        ...fullAnswers,
        gamesPerYear: 0,
        kidsCount: 2
    });
    assert.equal(withKids.kids, 60);
});

test('um ingresso gratuito por temporada não zera todos os jogos', () => {
    const cost = engine.getPlanCost(engine.assinaturasSocios.meuCruzeiro, {
        ...fullAnswers,
        gamesPerYear: 10
    });
    assert.equal(cost.ticketsMonthly, (9 * 150) / 12);
});

test('ranking é determinístico, finito e respeita o orçamento', () => {
    const first = engine.recommendPlans(fullAnswers);
    const second = engine.recommendPlans({ ...fullAnswers });
    assert.deepEqual(
        first.eligible.map((item) => [item.plan.slug, item.score]),
        second.eligible.map((item) => [item.plan.slug, item.score])
    );
    first.all.forEach((item) => {
        assert.ok(Number.isFinite(item.score));
        assert.ok(item.score >= 0 && item.score <= 100);
        assert.ok(item.eligibility.withinBudget);
    });
    first.eligible.forEach((item) => {
        assert.ok(item.cost.subscription <= fullAnswers.budget);
    });
});

test('enumeração representativa recalcula o espaço finito de respostas', (t) => {
    const rangeQuestions = engine.questions.filter((question) => question.type === 'range');
    const optionQuestions = engine.questions.filter((question) => question.type !== 'range');
    const nominalSpace = engine.questions.reduce((total, question) => {
        if (question.type === 'range') {
            return total * (question.max - question.min + 1 + (question.allowUnknown ? 1 : 0));
        }
        return total * question.options.length;
    }, 1);

    const rangeBaseline = {};
    rangeQuestions.forEach((question) => {
        rangeBaseline[question.key] = question.allowUnknown ? 'unknown' : 0;
    });

    const categorical = optionQuestions.reduce((combinations, question) => {
        const values = question.options.map((option) => option.value);
        return combinations.flatMap((combination) => values.map((value) => ({
            ...combination,
            [question.key]: value
        })));
    }, [{}]);

    let executed = 0;
    let conflicts = 0;
    for (const combination of categorical) {
        const answers = { ...rangeBaseline, ...combination };
        assert.deepEqual(engine.validateAnswers(answers), [], JSON.stringify(answers));
        const detected = engine.detectConflicts(answers);
        if (detected.length) {
            // Conflitos não entram nas métricas de recomendação: a interface
            // exige confirmação ou revisão antes de renderizar o resultado.
            conflicts += 1;
            detected.forEach((conflict) => assert.ok(conflict.keys.length > 0));
            continue;
        }

        const result = engine.recommendPlans(answers);
        assert.ok(result.recommendations.length >= 1 && result.recommendations.length <= 3);
        assert.equal(Boolean(result.winner), !result.noEligible);
        result.all.forEach((item) => {
            assert.ok(Number.isFinite(item.score), `${item.plan.slug} sem score finito`);
            assert.ok(item.score >= 0 && item.score <= 100);
        });
        result.eligible.forEach((item) => {
            assert.ok(item.cost.subscription <= answers.budget, `${item.plan.slug} acima do teto`);
        });
        executed += 1;
    }

    // Entradas numéricas adicionais são cobertas por limites e classes: zero,
    // faixas de nível 1/2/3, máximo e histórico desconhecido.
    const numericCases = {
        gamesPerYear: [0, 15, 30],
        gamesHistory: [0, 9, 10, 19, 20, 30, 'unknown']
    };
    const numericBaseline = {
        ...rangeBaseline,
        ...categorical[0],
        wantsGuaranteedTicket: false,
        gameFrequency: 'occasional'
    };
    Object.entries(numericCases).forEach(([key, values]) => {
        values.forEach((value) => {
            const answers = { ...numericBaseline, [key]: value };
            assert.deepEqual(engine.validateAnswers(answers), [], `${key}=${value}`);
            assert.equal(engine.detectConflicts(answers).length, 0, `${key}=${value}`);
            const result = engine.recommendPlans(answers);
            assert.ok(Number.isFinite(result.winner ? result.winner.score : result.closest.score));
            executed += 1;
        });
    });

    t.diagnostic(`espaço nominal: ${nominalSpace}; combinações executadas: ${executed}; combinações categoriais com conflito confirmável: ${conflicts}`);
    assert.equal(executed, categorical.length - conflicts + Object.values(numericCases).reduce((sum, values) => sum + values.length, 0));
});

test('ausência de plano elegível é explícita e não recomenda acima do teto', () => {
    const result = engine.recommendPlans({ ...fullAnswers, budget: 5 });
    assert.equal(result.noEligible, true);
    assert.equal(result.winner, null);
    assert.equal(result.recommendations.length, 3);
    result.recommendations.forEach((item) => {
        assert.equal(item.eligibility.withinBudget, false);
    });
    assert.equal(result.cheapest.plan.slug, 'meu-cruzeiro');
});

test('motivos do resultado citam respostas e condições comerciais', () => {
    const result = engine.recommendPlans(fullAnswers);
    assert.ok(result.winner.reasons.length >= 3);
    assert.ok(result.winner.reasons.some((reason) => /jogos por ano/i.test(reason)));
    assert.ok(result.winner.reasons.some((reason) => /adesão|estimad/i.test(reason)));
});

test('zero jogos reduz o peso do benefício de ingresso', () => {
    const result = engine.recommendPlans({
        ...fullAnswers,
        gamesPerYear: 0,
        wantsGuaranteedTicket: 'never',
        gameFrequency: 'occasional',
        budget: 400
    });
    assert.notEqual(result.winner.plan.slug, 'cabuloso-cativo');
    assert.ok(result.winner.reasons.some((reason) => /não pretende ir ao estádio/i.test(reason)));
});

test('ordem do catálogo não altera ranking nem índices', () => {
    const { scenarios } = require('./fixtures/reference-scenarios.js');
    const reversed = engine.plans.slice().reverse();
    const rotated = [...engine.plans.slice(2), ...engine.plans.slice(0, 2)];
    scenarios.filter((scenario) => scenario.split !== 'contradicao').forEach((scenario) => {
        const expected = engine.recommendPlans(scenario.answers).all.map((item) => [item.plan.slug, item.score]);
        [reversed, rotated].forEach((catalog) => {
            const actual = engine.recommendPlans(scenario.answers, catalog).all.map((item) => [item.plan.slug, item.score]);
            assert.deepEqual(actual, expected, scenario.id);
        });
    });
});

test('empate de índice e assinatura é resolvido pelo slug', () => {
    const cabuloso = engine.assinaturasSocios.cabuloso;
    const twinA = { ...cabuloso, slug: 'gemeo-a', nome: 'Gêmeo A' };
    const twinB = { ...cabuloso, slug: 'gemeo-b', nome: 'Gêmeo B' };
    const forward = engine.recommendPlans(fullAnswers, [twinB, twinA]).all.map((item) => item.plan.slug);
    const backward = engine.recommendPlans(fullAnswers, [twinA, twinB]).all.map((item) => item.plan.slug);
    assert.deepEqual(forward, ['gemeo-a', 'gemeo-b']);
    assert.deepEqual(backward, forward);
});

test('exemplo documentado da fórmula: 10 jogos, histórico 10, Sicoob, teto 100', () => {
    const answers = {
        gamesPerYear: 10,
        gamesHistory: 10,
        wantsGuaranteedTicket: false,
        buysTwoTickets: false,
        kidsCount: 0,
        needsPriority: false,
        wantsParticipation: true,
        wantsStoreDiscount: false,
        gameFrequency: 'occasional',
        digitalExperience: false,
        budget: 100,
        preferredSector: 'blue'
    };
    const result = engine.recommendPlans(answers);
    const byslug = Object.fromEntries(result.all.map((item) => [item.plan.slug, item]));

    assert.deepEqual(result.eligible.map((item) => item.plan.slug), ['cabuloso', 'time-do-povo', 'meu-cruzeiro']);
    assert.equal(byslug.cabuloso.score, 86.4);
    assert.equal(byslug['time-do-povo'].score, 72.6);
    assert.equal(byslug['meu-cruzeiro'].score, 66.4);
    assert.equal(byslug['cabuloso-max'].score, 77.3);
    assert.equal(byslug['cabuloso-max'].eligibility.withinBudget, false);
    assert.equal(byslug.cabuloso.cost.estimatedMonthly, 156.25);
    assert.equal(byslug['cabuloso-cativo'].sectorFit.level, 'partial');

    // O índice é exatamente a média ponderada dos componentes.
    result.all.forEach((item) => {
        const total = item.components.reduce((sum, c) => sum + c.weight, 0);
        const weighted = item.components.reduce((sum, c) => sum + c.weight * c.value, 0) / total * 100;
        assert.equal(item.score, Math.round(weighted * 10) / 10, item.plan.slug);
    });
});

test('desconto do ingresso entra só pelo custo, não pela utilidade', () => {
    const level1 = engine.recommendPlans({ ...fullAnswers, gamesHistory: 0 }).all.find((item) => item.plan.slug === 'cabuloso');
    const level3 = engine.recommendPlans({ ...fullAnswers, gamesHistory: 25 }).all.find((item) => item.plan.slug === 'cabuloso');
    const ticket = (item) => item.components.find((c) => c.key === 'ticket').value;
    assert.equal(ticket(level1), ticket(level3));
    assert.ok(level3.cost.estimatedMonthly < level1.cost.estimatedMonthly);
});

test('motivos seguem as regras que classificaram o plano', () => {
    const purple = engine.recommendPlans({ ...fullAnswers, preferredSector: 'purple', budget: 100 });
    assert.notEqual(purple.winner.sectorFit.level, 'full');
    assert.match(purple.winner.reasons[0], /setor/i);

    const cost = purple.winner.reasons.find((reason) => /Custo de uso estimado/.test(reason));
    assert.ok(cost, 'motivo de custo ausente');
    assert.ok(cost.includes(engine.formatBRL(purple.winner.cost.subscription)), 'custo deve separar a assinatura');
});
