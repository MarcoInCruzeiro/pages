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

test('catálogo mantém quatro planos ativos e as condições comerciais aceitas', () => {
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
    assert.match(engine.getPlanContract(tdp).priceText, /R\$\s*40,00 \/ mês/);
    assert.match(engine.getPlanContract(tdp).detail, /Valor mensal de referência/);

    assert.equal(engine.plans.length, 4);
    assert.equal(engine.assinaturasSocios.cabulosoCativo, undefined);

    engine.plans.forEach((plan) => {
        assert.equal(plan.contratacao.link.includes('intervalo_cobrancas=anual'), true, plan.slug);
    });

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

test('Kids é uma escolha binária numérica e mantém limites de defesa do perfil', () => {
    const question = engine.QUESTION_BY_KEY.kidsCount;
    assert.deepEqual(question.options.map(({ label, value }) => [label, value]), [['Não', 0], ['Sim', 1]]);
    for (const value of [0, 1]) {
        assert.equal(engine.isAnswerValid(question, value), true);
        assert.equal(engine.buildUserProfile({ ...fullAnswers, kidsCount: value }).kids, value);
    }
    for (const value of [2, 3, true, false, '1', null]) assert.equal(engine.isAnswerValid(question, value), false);
    assert.equal(engine.buildUserProfile({ ...fullAnswers, kidsCount: true }).kids, 1, 'compatibilidade do perfil não amplia respostas válidas');
    assert.equal(engine.buildUserProfile({ ...fullAnswers, kidsCount: -1 }).kids, 0);
    assert.equal(engine.buildUserProfile({ ...fullAnswers, kidsCount: 100 }).kids, engine.getDefaultConfiguration().pesosPerfil.kids.max);
});

test('apresentação de todos os planos usa referência mensal sem total anual ou parcelas', () => {
    for (const plan of engine.plans) {
        const contract = engine.getPlanContract(plan);
        assert.equal(contract.modalidade, plan.contratacao.modalidadePrincipal);
        assert.equal(contract.priceText, `${engine.formatBRL(plan.contratacao.precoMensalEquivalente)} / mês`);
        assert.match(contract.detail, /Valor mensal de referência/);
        assert.doesNotMatch([contract.priceText, contract.totalText, contract.detail].join(' '), /anual|parcel|\d+x\s*R\$/i);
    }
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
    assert.equal(withoutDigital.descuentos, withDigital.descuentos);
    assert.ok(withDigital.experiencias > withoutDigital.experiencias);
});

test('respostas "às vezes" de compra e conteúdo digital valem o ponto médio', () => {
    for (const key of ['wantsStoreDiscount', 'digitalExperience']) {
        assert.deepEqual(engine.QUESTION_BY_KEY[key].options.map((option) => option.value), [true, 'sometimes', false], key);
        assert.equal(engine.isAnswerValid(engine.QUESTION_BY_KEY[key], 'sometimes'), true, key);
    }
    const store = (value) => engine.buildUserProfile({ ...fullAnswers, wantsStoreDiscount: value }).descuentos;
    assert.deepEqual([store(true), store('sometimes'), store(false)], [8, 4.5, 1]);

    const digital = (value) => engine.buildUserProfile({ ...fullAnswers, wantsParticipation: false, digitalExperience: value }).experiencias;
    assert.deepEqual([digital(true), digital('sometimes'), digital(false)], [3, 2, 1]);
});

test('histórico desconhecido usa o texto configurado no checkbox', () => {
    const history = engine.QUESTION_BY_KEY.gamesHistory;
    assert.equal(history.unknownLabel, 'Não sei');
    assert.equal(engine.getAnswerError(history), 'Escolha uma quantidade de jogos ou marque “Não sei”.');
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
    assert.equal(always.descuentos, occasional.descuentos);
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
    const max = engine.assinaturasSocios.cabulosoMax;
    const cabuloso = engine.assinaturasSocios.cabuloso;
    const tdp = engine.assinaturasSocios.timeDoPovo;

    assert.equal(engine.getSectorFit(cabuloso, { ...fullAnswers, preferredSector: 'blue' }).level, 'full');
    assert.equal(engine.getSectorFit(tdp, { ...fullAnswers, preferredSector: 'purple' }).level, 'none');
    assert.equal(engine.getSectorFit(max, { ...fullAnswers, preferredSector: 'purple' }).level, 'full');
    assert.equal(engine.getSectorFit(cabuloso, { ...fullAnswers, preferredSector: 'purple' }).level, 'partial');
    assert.equal(engine.getSectorFit(tdp, { ...fullAnswers, preferredSector: 'yellow-orange' }).level, 'full');
});

test('preferência pelo Roxo oferece cobertura ativa sem reintroduzir o Cativo', () => {
    const result = engine.recommendPlans({ ...fullAnswers, preferredSector: 'purple' });
    const cativo = result.all.find((item) => item.plan.slug === 'cabuloso-cativo');
    assert.equal(cativo, undefined);
    assert.equal(result.winner.plan.slug, 'cabuloso-max');
    assert.ok(result.winner.reasons.some((reason) => /Roxo|setor/i.test(reason)) === false);
});

test('valores de assinatura, adesão e Kids são independentes, sem totais combinados', () => {
    assert.deepEqual(engine.getPlanPricing(engine.assinaturasSocios.cabulosoMax), {
        subscription: 200, adhesion: 30, kidsUnitPrice: 30
    });
    assert.deepEqual(engine.getPlanPricing(engine.assinaturasSocios.meuCruzeiro), {
        subscription: 12, adhesion: 0, kidsUnitPrice: 30
    });
});

test('frequência, acompanhantes e Kids não somam valores à assinatura apresentada', () => {
    const profiles = [
        { gamesPerYear: 0, buysTwoTickets: false, kidsCount: 0 },
        { gamesPerYear: 12, buysTwoTickets: true, kidsCount: 1 },
        { gamesPerYear: 30, buysTwoTickets: true, kidsCount: 1 }
    ];
    profiles.forEach((profile) => {
        const max = engine.recommendPlans({ ...fullAnswers, ...profile }).all
            .find((item) => item.plan.slug === 'cabuloso-max');
        assert.deepEqual(max.pricing, { subscription: 200, adhesion: 30, kidsUnitPrice: 30 });
        assert.equal(Object.hasOwn(max, 'cost'), false);
    });
});

test('exemplo de desconto do Max permanece unitário para titular e acompanhante', () => {
    const plan = engine.assinaturasSocios.cabulosoMax;
    const ticket = engine.getTicketBenefit(plan, { ...fullAnswers, gamesPerYear: 12, buysTwoTickets: true });
    assert.equal(ticket.quantidade, 2);
    assert.equal(ticket.desconto, 0.65);
    assert.match(ticket.text, /até 2 ingressos por jogo/i);
    assert.match(ticket.text, /Ex\.: de R\$ 150 por R\$ 52,50 cada/);
    assert.equal(engine.getTicketBenefit(plan, { ...fullAnswers, gamesPerYear: 30, kidsCount: 1 }).text, ticket.text);
});

test('taxas e preços de opcionais não entram no índice', () => {
    const original = engine.recommendPlans(fullAnswers);
    const catalog = structuredClone(engine.plans);
    catalog.forEach((plan) => {
        plan.contratacao.taxaAdesao = 999;
        plan.opcionais.kids.precoMensal = 777;
    });
    const changed = engine.recommendPlans(fullAnswers, catalog);
    original.all.forEach((item) => {
        const other = changed.all.find((candidate) => candidate.plan.slug === item.plan.slug);
        assert.equal(other.score, item.score, item.plan.slug);
        assert.deepEqual(other.components, item.components);
    });
});

test('ingresso gratuito é apresentado como benefício por temporada', () => {
    const ticket = engine.getTicketBenefit(engine.assinaturasSocios.meuCruzeiro, fullAnswers);
    assert.match(ticket.text, /1 ingresso gratuito por temporada/);
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
        assert.ok(item.pricing.subscription <= fullAnswers.budget);
    });
});

test('preço só filtra o orçamento: mudar preços elegíveis não altera índices nem ordem', () => {
    const original = engine.recommendPlans(fullAnswers);
    const catalog = structuredClone(engine.plans);
    for (const [index, plan] of catalog.entries()) {
        const price = 200 - index * 40;
        Object.assign(plan.contratacao, { precoMensal: price, precoMensalEquivalente: price, valorParcela: price });
    }
    const changed = engine.recommendPlans(fullAnswers, catalog);
    assert.deepEqual(changed.eligible.map((p) => [p.plan.slug, p.score]),
        original.eligible.map((p) => [p.plan.slug, p.score]));
    assert.ok(changed.all.every((p) => p.components.every((c) => c.key !== 'price')));
});

test('preço não desempata planos com os mesmos benefícios', () => {
    const plan = structuredClone(engine.assinaturasSocios.cabuloso);
    const expensive = { ...plan, slug: 'gemeo-a', contratacao: { ...plan.contratacao, precoMensalEquivalente: 200 } };
    const cheap = { ...plan, slug: 'gemeo-b', contratacao: { ...plan.contratacao, precoMensalEquivalente: 12 } };
    const forward = engine.recommendPlans(fullAnswers, [cheap, expensive]);
    const backward = engine.recommendPlans(fullAnswers, [expensive, cheap]);
    assert.equal(forward.all[0].score, forward.all[1].score);
    assert.deepEqual(forward.all.map((p) => p.plan.slug), ['gemeo-a', 'gemeo-b']);
    assert.deepEqual(backward.all.map((p) => p.plan.slug), ['gemeo-a', 'gemeo-b']);
});

test('orçamento não muda a afinidade dos planos que continuam elegíveis', () => {
    const low = engine.recommendPlans({ ...fullAnswers, budget: 100 });
    const high = engine.recommendPlans({ ...fullAnswers, budget: 400 });
    for (const item of low.eligible) {
        assert.equal(item.score, high.eligible.find((p) => p.plan.slug === item.plan.slug).score);
    }
    assert.deepEqual(low.eligible.map((p) => p.plan.slug),
        high.eligible.filter((p) => p.pricing.subscription <= 100).map((p) => p.plan.slug));
});

test('as quatro divergências rejeitadas recomendam os benefícios esperados', () => {
    const historical = require('./fixtures/four-plans/historical.json');
    const profiles = require('./fixtures/four-plans/profiles.json');
    const ids = ['CAL-02', 'CAL-10', 'PER-02-C', 'RES-05'];
    const scenarios = [...historical.scenarios, ...profiles.scenarios].filter((s) => ids.includes(s.id));
    assert.equal(scenarios.length, 4);
    for (const scenario of scenarios) {
        const result = engine.recommendPlans(scenario.answers);
        assert.ok(scenario.acceptable.includes(result.winner.plan.slug),
            `${scenario.id}: ${result.winner.plan.slug}; esperado ${scenario.acceptable.join(', ')}`);
    }
});

test('sem necessidade presencial, ingresso, prioridade e setor não distinguem planos', () => {
    const answers = { ...fullAnswers, gamesPerYear: 0, wantsGuaranteedTicket: 'never', gameFrequency: 'occasional' };
    const result = engine.recommendPlans(answers);
    const cabuloso = result.all.find((p) => p.plan.slug === 'cabuloso');
    const max = result.all.find((p) => p.plan.slug === 'cabuloso-max');
    assert.equal(cabuloso.score, max.score, 'benefícios presenciais não usados não devem favorecer o Max');
    for (const item of result.all) {
        for (const key of ['ticket', 'priority', 'sector']) {
            assert.equal(item.components.find((c) => c.key === key).weight, 0, key);
        }
    }
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
            assert.ok(item.pricing.subscription <= answers.budget, `${item.plan.slug} acima do teto`);
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
    assert.deepEqual(result.recommendations, []);
    assert.equal(result.all.length, 4);
    assert.ok(result.all.every((item) => !item.eligibility.withinBudget));
    assert.equal(result.cheapest.plan.slug, 'meu-cruzeiro');
});

test('motivos do resultado citam respostas e condições comerciais', () => {
    const result = engine.recommendPlans(fullAnswers);
    assert.ok(result.winner.reasons.length >= 3);
    assert.ok(result.winner.reasons.some((reason) => /jogos por ano/i.test(reason)));
    assert.ok(result.winner.reasons.some((reason) => /Assinatura/i.test(reason)));
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
    // Histórico 10 → nível 2 (55%): utilidade do ingresso 0,88; Max (65%) → 1.
    // Gratuito por temporada com 10 jogos: 0,45 + 0,4 × 1/10 = 0,49, fora do setor (× 0,1).
    assert.equal(byslug.cabuloso.score, 94.1);
    assert.equal(byslug['time-do-povo'].score, 54.4);
    assert.equal(byslug['meu-cruzeiro'].score, 53.8);
    assert.equal(byslug['cabuloso-max'].score, 98.8);
    assert.equal(byslug['cabuloso-max'].eligibility.withinBudget, false);
    assert.equal(byslug.cabuloso.pricing.subscription, 100);
    assert.equal(byslug['cabuloso-cativo'], undefined);

    // O índice é exatamente a média ponderada dos componentes.
    result.all.forEach((item) => {
        const total = item.components.reduce((sum, c) => sum + c.weight, 0);
        const weighted = item.components.reduce((sum, c) => sum + c.weight * c.value, 0) / total * 100;
        assert.equal(item.score, Math.round(weighted * 10) / 10, item.plan.slug);
    });
});

test('nível do ingresso altera só o benefício do Cabuloso, nunca o valor de assinatura', () => {
    const level1 = engine.recommendPlans({ ...fullAnswers, gamesHistory: 0 }).all.find((item) => item.plan.slug === 'cabuloso');
    const level3 = engine.recommendPlans({ ...fullAnswers, gamesHistory: 25 }).all.find((item) => item.plan.slug === 'cabuloso');
    const ticket = (item) => item.components.find((c) => c.key === 'ticket').value;
    assert.ok(ticket(level3) > ticket(level1), 'desconto maior vale mais no componente de ingresso');
    assert.deepEqual(level3.pricing, level1.pricing);
    assert.ok(level3.components.every((c) => c.key !== 'price'));
});

test('utilidade do ingresso com desconto cresce com o percentual do catálogo', () => {
    const utility = (slug, history) => engine.getTicketBenefit(engine.plans.find((p) => p.slug === slug), { ...fullAnswers, gamesHistory: history }).score;
    assert.equal(utility('cabuloso', 0), 0.8, '50% é a referência e mantém a utilidade configurada');
    assert.equal(utility('cabuloso', 10), 0.88);
    assert.equal(utility('cabuloso', 25), 0.96);
    assert.equal(utility('cabuloso-max', 'unknown'), 1, '65% atinge o teto 1');
    const utilities = engine.plans.map((plan) => engine.getTicketBenefit(plan, fullAnswers).score);
    assert.ok(utilities.every((value) => value >= 0 && value <= 1));
});

test('ingresso por temporada vale mais quando cobre parcela maior dos jogos declarados', () => {
    const meuCruzeiro = engine.assinaturasSocios.meuCruzeiro;
    const timeDoPovo = engine.assinaturasSocios.timeDoPovo;
    const utility = (plan, games) => engine.getTicketBenefit(plan, { ...fullAnswers, gamesPerYear: games }).score;
    assert.equal(utility(meuCruzeiro, 1), 0.85, '1 ingresso cobre o único jogo: utilidade base + bônus integral');
    assert.equal(utility(meuCruzeiro, 2), 0.65, 'cobre metade dos jogos');
    assert.equal(utility(meuCruzeiro, 10), 0.49);
    assert.equal(utility(meuCruzeiro, 30), 0.463333);
    assert.ok(utility(meuCruzeiro, 1) > utility(timeDoPovo, 1), 'com um jogo, o ingresso gratuito supera o popular');
    assert.ok(utility(meuCruzeiro, 2) < utility(timeDoPovo, 2), 'com dois jogos, o popular por jogo supera');
    assert.equal(utility(timeDoPovo, 1), utility(timeDoPovo, 30), 'o ingresso por jogo não depende do volume');
    assert.equal(utility(meuCruzeiro, 0), engine.getDefaultConfiguration().pesosRanking.ticket.utilidades.gratuito, 'sem jogos, utilidade base');
});

test('com teto de R$ 40, um jogo por ano aponta Meu Cruzeiro e dois ou mais o Time do Povo', () => {
    const base = { ...fullAnswers, wantsGuaranteedTicket: false, gameFrequency: 'occasional', needsPriority: false, wantsParticipation: false, wantsStoreDiscount: false, digitalExperience: false, budget: 40, preferredSector: 'yellow-orange' };
    const one = engine.recommendPlans({ ...base, gamesPerYear: 1 });
    assert.equal(one.winner.plan.slug, 'meu-cruzeiro');
    assert.ok(one.winner.score > one.runnerUp.score);
    for (const games of [2, 10]) {
        const result = engine.recommendPlans({ ...base, gamesPerYear: games });
        assert.equal(result.winner.plan.slug, 'time-do-povo', `${games} jogos`);
        assert.ok(result.winner.score > result.runnerUp.score, `${games} jogos`);
    }
});

test('sem uso presencial, a capacidade de ingressos para acompanhante não favorece o Max', () => {
    const answers = { ...fullAnswers, gamesPerYear: 0, wantsGuaranteedTicket: 'never', gameFrequency: 'occasional', buysTwoTickets: true, kidsCount: 1 };
    const result = engine.recommendPlans(answers);
    const cabuloso = result.all.find((p) => p.plan.slug === 'cabuloso');
    const max = result.all.find((p) => p.plan.slug === 'cabuloso-max');
    assert.equal(cabuloso.score, max.score, 'dois ingressos que ninguém usa não decidem');
    assert.equal(result.winner.plan.slug, 'cabuloso');
    const family = (item) => item.components.find((c) => c.key === 'family').value;
    assert.equal(family(cabuloso), family(max));
});

test('setor preferido ausente ou inválido é erro explícito, não caminho silencioso', () => {
    for (const preferredSector of [null, undefined, '', 'verde']) {
        assert.throws(() => engine.recommendPlans({ ...fullAnswers, preferredSector }), /Setor preferido inválido/);
    }
    const ranking = engine.getDefaultConfiguration().pesosRanking;
    assert.equal(ranking.sector.semPreferencia, undefined);
    assert.equal(ranking.sector.cobertura.notPreferred, undefined);
    assert.equal(ranking.ticket.cobertura.notPreferred, undefined);
});

test('com uso presencial e sem teto, o Max deixa de empatar com o Cabuloso por slug', () => {
    const result = engine.recommendPlans({ ...fullAnswers, gamesHistory: 25, needsPriority: true });
    const [first, second] = result.eligible;
    assert.equal(first.plan.slug, 'cabuloso-max');
    assert.equal(second.plan.slug, 'cabuloso');
    assert.ok(first.score > second.score, 'o desempate vem do benefício maior, não do slug');
});

test('motivos seguem as regras que classificaram o plano', () => {
    const purple = engine.recommendPlans({ ...fullAnswers, preferredSector: 'purple', budget: 100 });
    assert.notEqual(purple.winner.sectorFit.level, 'full');
    assert.match(purple.winner.reasons[0], /setor/i);

    const price = purple.winner.reasons.find((reason) => /Assinatura/.test(reason));
    assert.ok(price, 'valor da assinatura ausente');
    assert.ok(price.includes(engine.formatBRL(purple.winner.pricing.subscription)));
    assert.doesNotMatch(purple.winner.reasons.join(' '), /Custo de uso|primeiro mês|mais ingressos/i);
});

test('benefícios não anunciam carteirinha, pois quase todos os planos a incluem', () => {
    engine.plans.forEach((plan) => {
        const benefits = engine.getPlanBenefits(plan, fullAnswers);
        assert.doesNotMatch(benefits.join(' | '), /carteirinha/i, plan.slug);
    });
});

test('resultado do motor identifica a versão das regras vigentes', () => {
    const result = engine.recommendPlans(fullAnswers);
    assert.equal(result.rulesVersion, engine.RULES_VERSION,
        'rules_version do resultado deve vir do motor vigente, sem cópia literal do valor');
    assert.equal(result.catalogVersion, engine.CATALOG_VERSION);
});

test('torcedor sem estádio nem compras recebe Meu Cruzeiro em qualquer orçamento', () => {
    for (const budget of [40, 100, 200, 400]) {
        const answers = { ...fullAnswers, gamesPerYear: 0, wantsGuaranteedTicket: 'never', gameFrequency: 'occasional', wantsStoreDiscount: false, budget };
        const result = engine.recommendPlans(answers);
        assert.equal(result.winner.plan.slug, 'meu-cruzeiro');
        assert.equal(result.closeCall, false);
        assert.match(result.recommendationReason, /apoiar o clube/);
        assert.equal(engine.getCTAText(result.winner.plan, answers), 'Quero ser sócio');
    }
});

test('perfis presenciais e de compras têm uma indicação principal dentro do orçamento', () => {
    const cases = [
        [{ gamesPerYear: 0, wantsGuaranteedTicket: 'never', gameFrequency: 'occasional', budget: 200 }, 'cabuloso'],
        [{ budget: 40, preferredSector: 'yellow-orange' }, 'time-do-povo'],
        [{ budget: 100, preferredSector: 'blue' }, 'cabuloso'],
        [{ budget: 200, buysTwoTickets: true, preferredSector: 'purple' }, 'cabuloso-max']
    ];
    for (const [patch, slug] of cases) {
        const result = engine.recommendPlans({ ...fullAnswers, ...patch });
        assert.equal(result.winner.plan.slug, slug);
        assert.equal(result.closeCall, false);
        assert.ok(result.winner.eligibility.withinBudget);
    }
});
