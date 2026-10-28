import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../config/ga4/ga4.json' with { type: 'json' };
import { collectionDecision, initializeAnalytics, createEventDispatcher } from '../src/analytics.mjs';

function browser(url) {
    const inserted = [];
    return { location: { href: url }, inserted,
        document: { createElement: () => ({}), head: { appendChild: (script) => inserted.push(script) } } };
}

test('GA4 exclui desenvolvimento e preview mesmo inseridos na allowlist', () => {
    const altered = { ...config, ambientesHabilitados: [...config.ambientesHabilitados, 'localhost', '127.0.0.2', '::1'] };
    for (const url of ['http://localhost/', 'http://127.0.0.2/', 'http://[::1]/', 'file:///quiz/index.html',
        'https://quiz-socio.vercel.app/?preview=false', 'https://quiz-socio.vercel.app/#preview',
        'https://quiz-socio.vercel.app.attacker.test/']) {
        const target = browser(url);
        initializeAnalytics(altered, target);
        assert.equal(target.coletaHabilitada, false, url);
        assert.deepEqual(target.inserted, []);
        assert.deepEqual(target.dataLayer, []);
    }
    assert.equal(collectionDecision(config, 'https://quiz-socio.vercel.app/?utm_campaign=preview_newsletter').enabled, true);
});

test('GA4 inicializa uma vez e despacha um evento sem duplicar a fila', () => {
    const target = browser('https://quiz-socio.vercel.app/');
    initializeAnalytics(config, target);
    initializeAnalytics(config, target);
    assert.equal(target.inserted.length, 1);
    assert.deepEqual(target.dataLayer.map((command) => command[0]), ['js', 'set', 'config']);
    assert.equal(createEventDispatcher(config, target)('quiz_start'), true);
    assert.equal(target.dataLayer.length, 4);
    assert.equal(target.dataLayer[3][1], 'quiz_start');
});

test('GA4 usa nome configurado por identidade semântica e respeita supressão no despachante', () => {
    const altered = structuredClone(config);
    altered.eventos.find((event) => event.chave === 'quiz_start').nome = 'quiz_inicio_v2';
    const target = browser('https://quiz-socio.vercel.app/');
    initializeAnalytics(altered, target);
    const emit = createEventDispatcher(altered, target);
    assert.equal(emit('quiz_start'), true);
    assert.equal(target.dataLayer.at(-1)[1], 'quiz_inicio_v2');
    const count = target.dataLayer.length;
    target.coletaHabilitada = false;
    assert.equal(emit('quiz_start'), false);
    assert.equal(target.dataLayer.length, count);
    target.coletaHabilitada = true;
    target.isPreview = true;
    assert.equal(emit('quiz_start'), false);
    assert.equal(target.dataLayer.length, count);
});

test('GA4 falha fechado sem interromper o chamador e rejeita payload acima do teto', () => {
    const target = browser('https://quiz-socio.vercel.app/');
    initializeAnalytics(config, target);
    const emit = createEventDispatcher(config, target);
    const count = target.dataLayer.length;
    assert.equal(emit('quiz_complete', Object.fromEntries(Array.from({ length: 21 }, (_, index) => ['param' + index, index]))), false);
    assert.equal(emit('evento_desconhecido'), false);
    assert.equal(target.dataLayer.length, count);
    target.gtag = () => { throw new Error('medição indisponível'); };
    assert.equal(emit('quiz_start'), false);
    const unavailable = browser('https://quiz-socio.vercel.app/');
    unavailable.gtag = target.gtag;
    assert.doesNotThrow(() => initializeAnalytics(config, unavailable));
    assert.equal(unavailable.coletaHabilitada, false);
    const invalid = browser('https://quiz-socio.vercel.app/');
    initializeAnalytics({}, invalid);
    assert.equal(invalid.coletaHabilitada, false);
});
