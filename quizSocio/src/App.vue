<template>
    <SiteFrame>
        <main class="page" ref="pageElement"
            :class="{ 'page--results': section === 'results' }"
            :style="{ '--question-space': questionSpace + 'px' }">
            <section v-if="section === 'hero'" class="hero quiz-screen">
                <div class="hero-card" id="heroCard">
                    <p class="eyebrow">Quiz Sócio 5 Estrelas</p>
                    <h1>Encontre o plano perfeito para viver o Cruzeiro mais de perto.</h1>
                    <button class="start-button" id="startButton" type="button" @click="startQuiz">Iniciar</button>
                </div>
            </section>
            <QuizCard v-else-if="section === 'quiz' || section === 'conflict'" class="quiz-screen"
                :title="section === 'conflict' ? 'Confira suas respostas' : question.title"
                :step-label="section === 'conflict' ? 'Revisão de respostas' : `Pergunta ${step + 1} de ${motor.questions.length}`"
                :progress="progress" :error="error" :back-disabled="locked || (section === 'quiz' && step === 0)"
                :next-disabled="locked || (section === 'quiz' && !validAnswer)"
                :back-label="section === 'conflict' ? 'Revisar respostas' : 'Voltar'"
                :next-label="section === 'conflict' ? 'Manter e ver resultado' : step === motor.questions.length - 1 ? 'Ver resultado' : 'Continuar'"
                @back="back" @next="advance">
                <div v-if="section === 'conflict'" class="options" id="options">
                    <div class="conflict-panel" role="alert">
                        <p class="conflict-intro">Algumas escolhas parecem diferentes:</p>
                        <ul><li v-for="conflict in conflicts" :key="conflict.code || conflict.message">{{ conflict.message }}</li></ul>
                        <p class="conflict-help">Se estiver tudo certo, mantenha as respostas. Para ajustar, escolha “Revisar respostas”.</p>
                    </div>
                </div>
                <QuizQuestion v-else :key="question.key" :question="question" :value="answers[question.key]" @answer="selectAnswer" />
            </QuizCard>
            <section v-else-if="section === 'results'" class="results dynamic-section is-entering quiz-screen" id="results" aria-live="polite">
                <article class="result-card">
                    <span class="result-badge">{{ winner ? 'Plano recomendado' : 'Nenhum plano no orçamento' }}</span>
                    <div v-if="winner" class="result-plan">
                        <img id="resultLogo" :src="winner.plan.logo" :alt="`Logo do plano ${winner.plan.nome}`">
                        <div>
                            <p class="result-price" id="resultPrice">{{ contract.priceText }}</p>
                            <p class="result-contract" id="resultContract">{{ contract.detail }}</p>
                            <p class="result-contract" id="resultAdhesion">{{ winner.pricing.adhesion ? `Taxa única de adesão: ${motor.formatBRL(winner.pricing.adhesion)} (cobrada separadamente)` : 'Sem taxa de adesão' }}</p>
                        </div>
                    </div>
                    <p id="resultSummary" tabindex="-1">{{ summary }}</p>
                    <div id="sectorNotice">
                        <div v-if="winner && answers.preferredSector && winner.sectorFit.level !== 'full'" class="sector-warning" role="note">
                            <strong>Atenção ao setor:</strong> <span>{{ winner.sectorFit.text }}</span>
                            <a v-if="result.sectorAlternativeRecommendation" class="sector-alternative-link" :href="result.sectorAlternativeRecommendation.plan.contratacao.link"
                                target="_blank" rel="noopener noreferrer" @click="subscribe(result.sectorAlternativeRecommendation.plan, 'alternativa-setor')">
                                Ver alternativa que atende ao setor: {{ result.sectorAlternativeRecommendation.plan.nome }} ({{ formatScore(result.sectorAlternativeRecommendation.score) }} de 100)
                            </a>
                            <span v-else>Não há alternativa que atenda ao setor dentro do orçamento informado.</span>
                        </div>
                    </div>
                    <ul class="reason-list" id="resultReasons"><li v-for="(reason, index) in winner?.reasons || []" :key="index">{{ reason.text || reason }}</li></ul>
                    <details class="score-explainer" id="scoreExplainer">
                        <summary>Sobre a recomendação</summary>
                        <div>
                            <p>Comparamos suas respostas com os benefícios de cada plano. O resultado é uma sugestão para ajudar você a escolher; compare as opções antes de assinar.</p>
                            <p>Seu orçamento limita a assinatura. Taxa de adesão, opcionais e benefícios de ingresso são informados separadamente.</p>
                            <p id="assumptionNote">Exemplos de desconto usam {{ motor.ASSUMPTIONS.labels.precoIngressoCheio }}; o preço real varia por jogo e setor. {{ motor.ASSUMPTIONS.labels.kidsIngressos }}.</p>
                            <p>Confira a disponibilidade e as condições dos benefícios no site do Sócio 5 Estrelas.</p>
                        </div>
                    </details>
                    <div class="result-actions">
                        <button class="btn btn-secondary" id="restartButton" type="button" @click="restart">Refazer quiz</button>
                        <div class="actions-group">
                            <button class="btn btn-compare" id="compareButton" type="button" @click="comparisonOpen = true">Comparar planos</button>
                            <a class="btn btn-primary" id="subscribeButton" :href="winner?.plan.contratacao.link" :data-plan="winner?.plan.nome"
                                :aria-disabled="winner ? undefined : 'true'" :aria-label="winner ? `Assinar o plano ${winner.plan.nome}` : 'Sem plano elegível para contratação'"
                                target="_blank" rel="noopener noreferrer" @click="subscribeResult">
                                {{ winner ? 'Assinar agora' : 'Sem plano no orçamento' }}
                            </a>
                        </div>
                    </div>
                </article>
                <aside class="plans-card">
                    <div class="plans-title"><h2>{{ winner ? 'Melhores opções' : 'Planos para comparação' }}</h2><span>Ordenadas pela afinidade estimada</span></div>
                    <div class="plans-list" id="plansList">
                        <PlanCard v-for="(evaluation, index) in displayedPlans" :key="evaluation.plan.slug"
                            :evaluation="evaluation" :index="index" :result="result" :answers="answers" @subscribe="subscribe" />
                    </div>
                </aside>
            </section>
        </main>
        <ComparisonModal :open="comparisonOpen" :result="result" :answers="answers" @close="comparisonOpen = false" @subscribe="subscribe" />
    </SiteFrame>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, ref } from 'vue';
import SiteFrame from './components/SiteFrame.vue';
import QuizQuestion from './components/QuizQuestion.vue';
import QuizCard from './components/QuizCard.vue';
import PlanCard from './components/PlanCard.vue';
import ComparisonModal from './components/ComparisonModal.vue';
import { createEventDispatcher } from './analytics.mjs';
import { useQuizTransitions } from './composables/useQuizTransitions.js';
import { useQuestionSpace } from './composables/useQuestionSpace.js';

const motor = inject('motor');
const config = inject('config');
const trackEvent = createEventDispatcher(config.ga4);
const section = ref('hero');
const step = ref(0);
const answers = ref(motor.createInitialAnswers());
const result = ref(null);
const error = ref('');
const conflicts = ref([]);
const locked = ref(false);
const comparisonOpen = ref(false);
const pageElement = ref(null);
const questionSpace = useQuestionSpace(pageElement, motor.questions, motor.getAnswerError);
const transitions = useQuizTransitions(pageElement);
let startedAt = 0;
let shownAt = 0;

const question = computed(() => motor.questions[step.value]);
const validAnswer = computed(() => motor.isAnswerValid(question.value, answers.value[question.value.key]));
const progress = computed(() => section.value === 'conflict' ? 100 : (step.value + 1) / motor.questions.length * 100);
const winner = computed(() => result.value?.winner);
const contract = computed(() => winner.value ? motor.getPlanContract(winner.value.plan) : null);
const displayedPlans = computed(() => result.value ? (winner.value ? result.value.recommendations : result.value.all) : []);
const formatScore = (value) => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const secondsSince = (time) => Math.round((performance.now() - time) / 100) / 10;
const summary = computed(() => {
    if (!result.value) return '';
    if (!winner.value) return `Nenhum plano cabe no orçamento de assinatura de ${motor.formatBRL(result.value.budget)} por mês. A opção de assinatura mais barata é ${result.value.cheapest.plan.nome}, em ${motor.formatBRL(result.value.cheapest.pricing.subscription)}/mês. Os planos abaixo aparecem para comparação, sem recomendação.`;
    if (result.value.closeCall) return `${formatScore(winner.value.score)} de 100 de afinidade estimada — praticamente empatado com ${result.value.runnerUp.plan.nome} (${formatScore(result.value.runnerUp.score)}). Os dois atendem bem ao seu perfil.`;
    const scope = result.value.allPlansFit ? 'entre todos os planos' : 'entre os planos que cabem no seu orçamento';
    return `${formatScore(winner.value.score)} de 100 de afinidade estimada — a maior ${scope}.`;
});

async function changeView(change, focus = '#quizTitle') {
    if (locked.value) return;
    locked.value = true;
    const screenChange = section.value === 'hero' || section.value === 'results'
        || (section.value === 'conflict' && focus === '#resultSummary');
    const previous = await transitions.leave(screenChange);
    change();
    await transitions.enter(previous);
    document.querySelector(focus)?.focus({ preventScroll: true });
    const behavior = transitions.reduceMotion() ? 'instant' : 'smooth';
    if (section.value === 'results') pageElement.value?.querySelector('#results')?.scrollIntoView({ behavior, block: 'start' });
    else if (section.value === 'hero') window.scrollTo({ top: 0, behavior });
    shownAt = performance.now();
    locked.value = false;
}
function startQuiz() {
    return changeView(() => {
        answers.value = motor.createInitialAnswers();
        step.value = 0;
        section.value = 'quiz';
        result.value = null;
        error.value = '';
        startedAt = performance.now();
        trackEvent('quiz_start');
    });
}
function selectAnswer(value) {
    if (locked.value) return;
    answers.value[question.value.key] = value;
    error.value = '';
}
function answerLabel(current, value) {
    if (value === 'unknown') return current.unknownLabel || 'Não sei';
    if (current.type === 'range') return `${value} ${current.suffix}`;
    return current.options.find((option) => Object.is(option.value, value))?.label || String(value);
}
function advance() {
    if (locked.value || result.value) return;
    if (section.value === 'conflict') return changeView(showResults, '#resultSummary');
    const current = question.value;
    const value = answers.value[current.key];
    if (!motor.isAnswerValid(current, value)) {
        error.value = motor.getAnswerError(current);
        nextTick(() => document.querySelector('#unknownToggle, #rangeInput, #options .option')?.focus({ preventScroll: true }));
        return;
    }
    return changeView(() => {
        trackEvent('quiz_answer', {
            quiz_step: step.value + 1, quiz_question: current.key,
            quiz_answer: String(value), quiz_answer_label: answerLabel(current, value), answer_time_sec: secondsSince(shownAt)
        });
        error.value = '';
        if (step.value < motor.questions.length - 1) { step.value++; return; }
        const invalid = motor.validateAnswers(answers.value);
        if (invalid.length) { step.value = invalid[0].index; error.value = invalid[0].message; return; }
        conflicts.value = motor.detectConflicts(answers.value);
        if (conflicts.value.length) section.value = 'conflict';
        else showResults();
    }, step.value === motor.questions.length - 1 ? '#resultSummary, #quizTitle' : '#quizTitle');
}
function back() {
    return changeView(() => {
        if (section.value === 'conflict') { section.value = 'quiz'; step.value = 0; }
        else if (step.value > 0) step.value--;
        error.value = '';
    });
}
function showResults() {
    if (result.value) return;
    result.value = motor.recommendPlans(answers.value);
    section.value = 'results';
    trackEvent('quiz_complete', {
        recommended_plan: winner.value?.plan.nome || 'none', affinity_index: winner.value?.score ?? null,
        compatibility: winner.value?.score ?? null, score_semantics: 'indice_afinidade_estimado',
        no_eligible_plan: Boolean(result.value.noEligible), catalog_version: motor.CATALOG_VERSION,
        rules_version: result.value.rulesVersion, total_time_sec: secondsSince(startedAt),
        ...Object.fromEntries(motor.questions.map((item) => [`answer_${item.key}`, String(answers.value[item.key])]))
    });
}
function restart() {
    return changeView(() => {
        comparisonOpen.value = false;
        result.value = null;
        answers.value = motor.createInitialAnswers();
        conflicts.value = [];
        error.value = '';
        step.value = 0;
        section.value = 'hero';
    }, '#startButton');
}
function subscribe(plan, location) {
    trackEvent('quiz_subscribe_click', {
        plan: plan.nome, recommended_plan: winner.value?.plan.nome || 'none',
        clicked_recommended: String(plan.slug === winner.value?.plan.slug), cta_location: location
    });
}
function subscribeResult(event) {
    const link = event.currentTarget;
    if (!link.hasAttribute('href') || link.getAttribute('aria-disabled') === 'true' || !winner.value) {
        event.preventDefault();
        return;
    }
    subscribe(winner.value.plan, 'resultado');
}
onMounted(async () => {
    if (!window.isPreview) return;
    answers.value = { gamesPerYear: 15, gamesHistory: 'unknown', wantsGuaranteedTicket: true,
        buysTwoTickets: true, kidsCount: 0, needsPriority: true, wantsParticipation: true,
        wantsStoreDiscount: true, gameFrequency: 'always', digitalExperience: true, budget: 200, preferredSector: 'blue' };
    showResults();
    await nextTick();
    document.getElementById('resultSummary')?.focus({ preventScroll: true });
});
</script>
