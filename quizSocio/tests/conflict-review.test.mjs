import test from 'node:test';
import assert from 'node:assert/strict';
import engine from '../quiz-engine.js';
import { getConflictReviewKeys } from '../src/conflict-review.mjs';

const cases = [
    ['dois sinais de presença isolam a intenção de zero jogos',
        { gamesPerYear: 0, wantsGuaranteedTicket: true, gameFrequency: 'always' }, ['gamesPerYear']],
    ['a declaração de não frequentar diverge de dois sinais de presença',
        { gamesPerYear: 15, wantsGuaranteedTicket: 'never', gameFrequency: 'frequent' }, ['wantsGuaranteedTicket']],
    ['dois sinais de ausência isolam a frequência declarada',
        { gamesPerYear: 0, wantsGuaranteedTicket: 'never', gameFrequency: 'always' }, ['gameFrequency']],
    ['foco em jogos decisivos também sustenta presença, sem impor ingresso garantido',
        { gamesPerYear: 0, wantsGuaranteedTicket: false, gameFrequency: 'always' }, ['gamesPerYear']],
    ['sem maioria clara, revisão contém apenas as duas perguntas em conflito',
        { gamesPerYear: 0, wantsGuaranteedTicket: true, gameFrequency: 'occasional' }, ['gamesPerYear', 'wantsGuaranteedTicket']],
    ['acompanhar mais de casa não significa ausência quando há intenção de ir a jogos',
        { gamesPerYear: 10, wantsGuaranteedTicket: false, gameFrequency: 'occasional' }, []]
];
for (const [name, answers, expected] of cases) {
    test(`revisão seletiva: ${name}`, () => {
        const original = structuredClone(answers);
        const conflicts = engine.detectConflicts(answers);
        assert.deepEqual(getConflictReviewKeys(engine.questions, conflicts, answers), expected);
        assert.deepEqual(answers, original, 'não corrigir respostas silenciosamente');
    });
}

test('revisão remove duplicatas e segue a ordem configurada das perguntas', () => {
    const answers = { gamesPerYear: 0, wantsGuaranteedTicket: true, gameFrequency: 'occasional' };
    const conflicts = engine.detectConflicts(answers);
    assert.deepEqual(getConflictReviewKeys(engine.questions.slice().reverse(), [...conflicts, ...conflicts], answers),
        ['wantsGuaranteedTicket', 'gamesPerYear']);
});

test('conflitos fora do domínio de presença mantêm apenas suas próprias perguntas', () => {
    const answers = { gamesPerYear: 15, wantsGuaranteedTicket: true, gameFrequency: 'always' };
    const conflicts = [{ keys: ['budget', 'preferredSector'] }];
    assert.deepEqual(getConflictReviewKeys(engine.questions, conflicts, answers), ['budget', 'preferredSector']);
});
