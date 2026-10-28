/** The only GA4 bootstrap and dispatcher used by the public application. */
export function collectionDecision(config, url) {
    const current = new URL(url);
    const host = current.hostname.replace(/^\[+|\]+$/g, '').toLowerCase();
    const preview = current.searchParams.has('preview') || current.hash === '#preview';
    const local = current.protocol === 'file:' || host === 'localhost'
        || host === '::1' || host === '0:0:0:0:0:0:0:1' || /^127(?:\.\d{1,3}){3}$/.test(host);
    const enabled = /^G-[A-Z0-9]+$/.test(config?.propriedade?.measurementId || '')
        && Array.isArray(config?.ambientesHabilitados)
        && config.ambientesHabilitados.includes(host);
    return { preview, enabled: Boolean(enabled && !local && !preview) };
}

export function initializeAnalytics(config, target = window) {
    const decision = collectionDecision(config, target.location.href);
    target.isPreview = decision.preview;
    target.coletaHabilitada = decision.enabled;
    target.dataLayer ||= [];
    target.gtag ||= function () { target.dataLayer.push(arguments); };
    if (!decision.enabled || target.__quizAnalyticsInitialized) return;
    target.__quizAnalyticsInitialized = true;
    try {
        target.gtag('js', new Date());
        target.gtag('set', 'allow_google_signals', false);
        target.gtag('config', config.propriedade.measurementId);
        const script = target.document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.propriedade.measurementId)}`;
        target.document.head.appendChild(script);
    } catch {
        target.coletaHabilitada = false;
    }
}

export function createEventDispatcher(config, target = window) {
    return (event, params = {}) => {
        if (!target.coletaHabilitada || target.isPreview || typeof target.gtag !== 'function') return false;
        const definition = config?.eventos?.find((item) => (item.chave || item.nome) === event);
        if (!definition || Object.keys(params).length > config.limiteParametrosPersonalizados) return false;
        try { target.gtag('event', definition.nome, params); return true; }
        catch { return false; }
    };
}
