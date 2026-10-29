import { h, onBeforeUnmount, onMounted, ref, render } from 'vue';
import QuizCard from '../components/QuizCard.vue';
import QuizQuestion from '../components/QuizQuestion.vue';

/** Compare plain text/option fragments in one layout pass. Unlike mounting each
 * Vue question state, these inert clones have no watchers or event handlers.
 * The real card is then measured only for the largest option question and ranges. */
function sizingCandidates(questions, host, getAnswerError) {
    const card = host.firstElementChild;
    const rack = document.createElement('div');
    rack.style.width = card.querySelector('.options').getBoundingClientRect().width + 'px';
    const titleTemplate = card.querySelector('.question');
    const optionTemplate = card.querySelector('.option');
    const errorTemplate = card.querySelector('.field-error');
    const gap = parseFloat(getComputedStyle(card.querySelector('.options')).rowGap) || 0;
    const entries = [];
    const clone = (template, text) => {
        const element = template.cloneNode(true);
        element.removeAttribute('id');
        if (text !== undefined) element.textContent = text;
        rack.appendChild(element);
        return element;
    };
    for (const question of questions.filter(item => item.type === 'option')) {
        const title = clone(titleTemplate, question.title);
        const options = question.options.map(option => {
            const element = clone(optionTemplate);
            element.querySelector('.option-label').textContent = option.label;
            let description = element.querySelector('.option-description');
            if (option.description) {
                if (!description) {
                    description = document.createElement('span');
                    description.className = 'option-description';
                    element.appendChild(description);
                }
                description.textContent = option.description;
            } else description?.remove();
            return element;
        });
        const error = clone(errorTemplate, getAnswerError(question));
        error.hidden = false;
        entries.push({ question, title, options, error });
    }
    host.appendChild(rack);
    try {
        const size = entry => entry.title.getBoundingClientRect().height
            + entry.options.reduce((total, option) => total + option.getBoundingClientRect().height, 0)
            + Math.max(0, entry.options.length - 1) * gap + entry.error.getBoundingClientRect().height;
        const largest = entries.reduce((best, entry) => !best || size(entry) > size(best) ? entry : best, null);
        return [largest?.question, ...questions.filter(item => item.type === 'range')].filter(Boolean);
    } finally { rack.remove(); }
}

/** Reuse reservations by width/font; never mount all 12 hidden question states. */
export function useQuestionSpace(pageElement, questions, getAnswerError) {
    const height = ref(450);
    let observer;
    let mounted = false;
    let lastWidth;
    let lastFont;
    const reservations = new Map();
    const fontsLoaded = () => { reservations.clear(); measure(); };

    function measure() {
        const page = pageElement.value;
        if (!mounted || !page) return;
        const style = getComputedStyle(page);
        const width = page.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        if (!width) return;
        lastWidth = width;
        lastFont = style.font;
        const cacheKey = `${width}:${style.font}:${document.fonts?.status}`;
        if (reservations.has(cacheKey)) {
            height.value = reservations.get(cacheKey);
            return;
        }
        const host = document.createElement('div');
        host.inert = true;
        host.setAttribute('aria-hidden', 'true');
        Object.assign(host.style, { position: 'absolute', top: '0', left: '0', width: width + 'px',
            visibility: 'hidden', pointerEvents: 'none' });
        page.appendChild(host);
        let maximum = 0;
        try {
            const seed = questions.reduce((best, question) => (question.options?.length || 0) > (best.options?.length || 0) ? question : best);
            const draw = (question, value) => {
                const index = questions.indexOf(question);
                render(h(QuizCard, {
                    title: question.title, stepLabel: `Pergunta ${index + 1} de ${questions.length}`,
                    progress: (index + 1) / questions.length * 100,
                    error: getAnswerError(question), idPrefix: 'measure-quiz-',
                    nextLabel: index === questions.length - 1 ? 'Ver resultado' : 'Continuar'
                }, { default: () => h(QuizQuestion, { key: question.key, question, value, idPrefix: 'measure-quiz-' }) }), host);
            };
            draw(seed, null);
            for (const question of sizingCandidates(questions, host, getAnswerError)) {
                // The unknown range label can wrap differently from the number.
                for (const value of question.type === 'range' ? [question.max, ...(question.allowUnknown ? ['unknown'] : [])] : [null]) {
                    if (question !== seed || value !== null) draw(question, value);
                    maximum = Math.max(maximum, host.firstElementChild.getBoundingClientRect().height);
                }
            }
            height.value = Math.ceil(maximum) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
            reservations.set(cacheKey, height.value);
        } finally {
            render(null, host);
            host.remove();
        }
    }

    onMounted(() => {
        mounted = true;
        measure();
        observer = new ResizeObserver(() => {
            const page = pageElement.value;
            const style = getComputedStyle(page);
            const width = page.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            if (width !== lastWidth || style.font !== lastFont) measure();
        });
        observer.observe(pageElement.value);
        document.fonts?.ready.then(() => { if (mounted && document.fonts.status === 'loaded') measure(); });
        document.fonts?.addEventListener('loadingdone', fontsLoaded);
    });
    onBeforeUnmount(() => {
        mounted = false;
        observer?.disconnect();
        document.fonts?.removeEventListener('loadingdone', fontsLoaded);
    });
    return height;
}
