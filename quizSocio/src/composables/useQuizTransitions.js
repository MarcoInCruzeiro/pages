import { nextTick, onBeforeUnmount } from 'vue';

/** Match the original fades and card sizing without duplicating screen state. */
export function useQuizTransitions(pageElement) {
    const animations = new Set();
    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stop = () => { for (const animation of animations) animation.cancel(); animations.clear(); };
    function animate(element, keyframes, duration) {
        if (!element || reduceMotion() || typeof element.animate !== 'function') return null;
        const animation = element.animate(keyframes, { duration, easing: 'ease-out' });
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
        return animation;
    }
    async function leave(screenChange) {
        stop();
        const section = pageElement.value?.querySelector(':scope > section');
        const height = section?.getBoundingClientRect().height;
        const targets = screenChange ? [section] : [...section.querySelectorAll('.question, .options')];
        const leaving = targets.map((target) => animate(target, [{ opacity: 1 }, { opacity: 0 }], screenChange ? 400 : 220));
        await Promise.all(leaving.filter(Boolean).map((animation) => animation.finished.catch(() => {})));
        return { section, height };
    }
    async function enter(previous) {
        await nextTick();
        const section = pageElement.value?.querySelector(':scope > section');
        const sameSection = section === previous.section;
        const targets = sameSection ? [...section.querySelectorAll('.question, .options')] : [section];
        for (const target of targets) animate(target, [{ opacity: 0 }, { opacity: 1 }], sameSection ? 220 : 400);
        if (sameSection && previous.height) {
            const nextHeight = section.getBoundingClientRect().height;
            if (Math.abs(nextHeight - previous.height) > 1) {
                animate(section, [{ height: previous.height + 'px' }, { height: nextHeight + 'px' }], 400);
            }
        }
    }
    onBeforeUnmount(stop);
    return { leave, enter, reduceMotion };
}
