import { h, onBeforeUnmount, onMounted, ref, render } from 'vue';
import QuizCard from '../components/QuizCard.vue';
import QuizQuestion from '../components/QuizQuestion.vue';

/** Reserve the largest real question card, including validation and page padding. */
export function useQuestionSpace(pageElement, questions, getAnswerError) {
    const height = ref(450);
    let observer;
    let mounted = false;
    let lastWidth;
    let lastFont;

    function measure() {
        const page = pageElement.value;
        if (!mounted || !page) return;
        const style = getComputedStyle(page);
        const width = page.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        if (!width) return;
        lastWidth = width;
        lastFont = style.font;
        const host = document.createElement('div');
        host.inert = true;
        host.setAttribute('aria-hidden', 'true');
        Object.assign(host.style, { position: 'absolute', top: '0', left: '0', width: width + 'px',
            visibility: 'hidden', pointerEvents: 'none' });
        page.appendChild(host);
        let maximum = 0;
        try {
            for (const [index, question] of questions.entries()) {
                const values = question.type === 'range'
                    ? [question.max, ...(question.allowUnknown ? ['unknown'] : [])] : [null];
                for (const value of values) {
                    render(h(QuizCard, {
                        title: question.title, stepLabel: `Pergunta ${index + 1} de ${questions.length}`,
                        progress: (index + 1) / questions.length * 100,
                        error: getAnswerError(question), idPrefix: 'measure-quiz-',
                        nextLabel: index === questions.length - 1 ? 'Ver resultado' : 'Continuar'
                    }, { default: () => h(QuizQuestion, { key: question.key, question, value, idPrefix: 'measure-quiz-' }) }), host);
                    maximum = Math.max(maximum, host.firstElementChild.getBoundingClientRect().height);
                }
            }
            height.value = Math.ceil(maximum) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
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
        document.fonts?.ready.then(() => { if (mounted) measure(); });
        document.fonts?.addEventListener('loadingdone', measure);
    });
    onBeforeUnmount(() => {
        mounted = false;
        observer?.disconnect();
        document.fonts?.removeEventListener('loadingdone', measure);
    });
    return height;
}
