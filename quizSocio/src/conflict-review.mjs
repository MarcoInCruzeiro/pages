/** Select review questions without changing answers or the engine's conflict rules. */
export function getConflictReviewKeys(questions, conflicts, answers) {
    const presence = answers.wantsGuaranteedTicket;
    const frequency = answers.gameFrequency;
    const signals = {
        gamesPerYear: Number.isInteger(answers.gamesPerYear) && answers.gamesPerYear >= 0
            ? answers.gamesPerYear > 0 : null,
        wantsGuaranteedTicket: presence === 'never' ? false
            : presence === true || presence === false ? true : null,
        // "Acompanho mais de casa" still allows occasional stadium attendance.
        gameFrequency: frequency === 'always' || frequency === 'frequent' ? true : null
    };
    const votes = Object.values(signals).filter(value => value !== null);
    const attending = votes.filter(Boolean).length;
    const absent = votes.length - attending;
    const majority = attending >= 2 ? true : absent >= 2 ? false : null;
    const review = new Set();

    for (const conflict of conflicts) {
        const keys = conflict.keys || [];
        const comparable = keys.every(key => typeof signals[key] === 'boolean');
        const minority = majority !== null && comparable
            ? keys.filter(key => signals[key] !== majority) : [];
        // Ties, neutral answers and other conflict domains need a user's choice.
        for (const key of minority.length ? minority : keys) review.add(key);
    }
    return questions.filter(question => review.has(question.key)).map(question => question.key);
}
