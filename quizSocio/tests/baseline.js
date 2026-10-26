/*
 * Gera a linha de base do QUIZ-009: executa o ranking do commit 2cecf81 sobre
 * toda a referência sintética e grava tests/fixtures/baseline-reference.json.
 *
 * Fica fora de `npm test` porque depende do histórico git (um clone raso pode
 * não ter o commit). O JSON gerado é versionado; rode `npm run baseline` só
 * quando a referência mudar.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { scenarios } = require('./fixtures/reference-scenarios.js');

const COMMIT = '2cecf81';
const OUTPUT = path.join(__dirname, 'fixtures', 'baseline-reference.json');

const MAPPING = {
    gamesHistory: 'descartado: a versão antiga não perguntava histórico',
    kidsCount: 'familyPlan = kidsCount > 0 (a pergunta antiga era “dependentes, filhos ou cônjuge”)',
    buysTwoTickets: 'mantido: mesma chave e mesmos valores',
    demais: 'mantidos: mesmas chaves e valores de opção'
};

function loadOldEngine() {
    const html = execFileSync('git', ['show', `${COMMIT}:./index.html`], {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024
    });
    const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
    const source = blocks.find((block) => block.includes('function recommendPlans'));
    if (!source) throw new Error(`recommendPlans não encontrado em ${COMMIT}`);

    // DOM inerte: qualquer acesso devolve o próprio stub, para o script
    // inicializar sem navegador. Só o motor é usado.
    const stub = new Proxy(function () {}, {
        get: (target, key) => (key === Symbol.toPrimitive ? () => '' : key === 'then' ? undefined : stub),
        apply: () => stub,
        construct: () => stub
    });
    const context = vm.createContext({
        document: stub,
        window: stub,
        navigator: stub,
        localStorage: stub,
        location: { search: '', hash: '', href: 'http://localhost/' },
        setTimeout: () => 0,
        clearTimeout: () => {},
        requestAnimationFrame: () => 0,
        console
    });
    vm.runInContext(`${source}\n;globalThis.__old = { state, recommendPlans, plans };`, context);
    return context.__old;
}

function toOldAnswers(answers) {
    const { gamesHistory, kidsCount, ...rest } = answers;
    return { ...rest, familyPlan: kidsCount > 0 };
}

function run() {
    const old = loadOldEngine();
    const cheapest = Math.min(...old.plans.map((plan) => plan.precoMensal));

    const cases = scenarios.map((scenario) => {
        const oldAnswers = toOldAnswers(scenario.answers);
        Object.assign(old.state.answers, oldAnswers);
        const ranking = old.recommendPlans().map((item) => ({
            plan: item.plan.slug,
            score: item.compatibilityPercent,
            withinBudget: item.plan.precoMensal <= scenario.answers.budget
        }));
        const slugs = ranking.map((item) => item.plan);
        return {
            id: scenario.id,
            split: scenario.split,
            category: scenario.category,
            oldAnswers,
            ranking,
            top1: scenario.acceptable.includes(slugs[0]),
            top3: slugs.slice(0, 3).some((slug) => scenario.acceptable.includes(slug)),
            budgetFallback: scenario.answers.budget < cheapest,
            violation: ranking.some((item) => !item.withinBudget),
            conflictDetected: false
        };
    });

    const output = {
        commit: COMMIT,
        label: 'Ranking anterior (cosseno + penalidade de preço + bônus de setor) sobre a referência do QUIZ-009',
        generatedBy: 'npm run baseline',
        mapping: MAPPING,
        note: 'A versão antiga não detectava contradições; nos cenários CON-* ela recomenda normalmente.',
        cases
    };
    fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
    return output;
}

if (require.main === module) {
    const output = run();
    output.cases.forEach((item) => {
        const top = item.ranking.slice(0, 3).map((row) => `${row.plan}:${row.score}`).join(' | ');
        console.log(`${item.id.padEnd(7)} ${item.top1 ? 'ok' : 'XX'} ${item.violation ? 'VIOL' : '    '} ${top}`);
    });
    console.log(`Gravado em ${path.relative(process.cwd(), OUTPUT)}`);
}

module.exports = { run, toOldAnswers, MAPPING };
