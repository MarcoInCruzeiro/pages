<template>
    <SiteFrame>
        <main class="page" ref="pageElement"
            :class="{ 'page--results': section === 'results' }"
            :style="{ '--question-space': questionSpace + 'px' }">
            <section v-if="section === 'hero'" class="hero quiz-screen">
                <div class="hero-card" id="heroCard">
                    <p class="eyebrow">SEU PLANO IDEAL</p>
                    <h1>Encontre o plano perfeito para viver o Cruzeiro mais de perto.</h1>
                    <button class="start-button" id="startButton" type="button" @click="startQuiz">Iniciar</button>
                </div>
            </section>
            <QuizCard v-else-if="section === 'quiz' || section === 'conflict'" class="quiz-screen"
                :title="section === 'conflict' ? 'Confira suas respostas' : question.title"
                :step-label="stepLabel"
                :progress="progress" :error="error" :back-disabled="locked || (section === 'quiz' && firstQuestion)"
                :next-disabled="locked || (section === 'quiz' && !validAnswer)"
                :back-label="section === 'conflict' ? 'Revisar respostas' : 'Voltar'"
                :next-label="nextLabel"
                @back="back" @next="advance">
                <div v-if="section === 'conflict'" class="options" id="options">
                    <div class="conflict-panel" role="alert">
                        <p class="conflict-intro">Algumas escolhas parecem diferentes:</p>
                        <ul><li v-for="conflict in conflicts" :key="conflict.code || conflict.message">{{ conflict.message }}</li></ul>
                        <p class="conflict-help">Se estiver tudo certo, mantenha as respostas. Para ajustar apenas os pontos em conflito, escolha “Revisar respostas”.</p>
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
                            <p class="result-contract" id="resultContract">{{ contract.totalText }}</p>
                            <p class="result-contract" id="resultAdhesion">{{ winner.pricing.adhesion ? `Taxa única de adesão de ${motor.formatBRL(winner.pricing.adhesion)}, à parte` : 'Sem taxa de adesão' }}</p>
                        </div>
                    </div>
                    <p id="resultSummary" tabindex="-1">{{ summary }}</p>
                    <div id="sectorNotice">
                        <div v-if="winner && result.profile.frecuencia > 0 && answers.preferredSector && winner.sectorFit.level !== 'full'" class="sector-warning" role="note">
                            <strong>Atenção ao setor:</strong> <span>{{ winner.sectorFit.text }}</span>
                            <a v-if="result.sectorAlternativeRecommendation" class="sector-alternative-link" :href="result.sectorAlternativeRecommendation.plan.contratacao.link"
                                target="_blank" rel="noopener noreferrer" @click="subscribe(result.sectorAlternativeRecommendation.plan, 'alternativa-setor')">
                                Ver o plano que cobre esse setor: {{ result.sectorAlternativeRecommendation.plan.nome }} (afinidade {{ formatScore(result.sectorAlternativeRecommendation.score) }} de 100)
                            </a>
                            <span v-else>Nenhum plano dentro do seu orçamento inclui esse setor. Se ele for decisivo, vale revisar o orçamento.</span>
                        </div>
                    </div>
                    <ul class="reason-list" id="resultReasons"><li v-for="(reason, index) in winner?.reasons || []" :key="index">{{ reason.text || reason }}</li></ul>
                    <details class="score-explainer" id="scoreExplainer">
                        <summary>Sobre a recomendação</summary>
                        <div>
                            <p>Cruzamos suas respostas com os benefícios de cada plano para chegar a esta sugestão. Ela é um ponto de partida: vale comparar as opções antes de assinar.</p>
                            <p>O orçamento limita quais assinaturas podemos recomendar. Entre elas, a ordem considera os benefícios e suas respostas; o menor preço não aumenta a afinidade. Taxa de adesão, opcionais e ingressos ficam separados.</p>
                            <p id="assumptionNote">Os exemplos de desconto consideram {{ motor.ASSUMPTIONS.labels.precoIngressoCheio }}; o preço real muda conforme o jogo e o setor. {{ motor.ASSUMPTIONS.labels.kidsIngressos }}.</p>
                            <p>Disponibilidade e condições de cada benefício estão no site do Sócio 5 Estrelas.</p>
                        </div>
                    </details>
                    <div class="result-actions">
                        <button class="btn btn-secondary" id="restartButton" type="button" @click="restart">Refazer quiz</button>
                        <div class="actions-group">
                            <button class="btn btn-compare" id="compareButton" type="button" @click="comparisonOpen = true">Comparar planos</button>
                            <a class="btn btn-primary" id="subscribeButton" :href="winner?.plan.contratacao.link" :data-plan="winner?.plan.nome"
                                :aria-disabled="winner ? undefined : 'true'" :aria-label="winner ? `Assinar agora o plano ${winner.plan.nome}` : 'Sem plano no orçamento para assinar'"
                                target="_blank" rel="noopener noreferrer" @click="subscribeResult">
                                {{ winner ? motor.getCTAText(winner.plan, answers) : 'Sem plano no orçamento' }}
                            </a>
                        </div>
                    </div>
                </article>
                <aside class="plans-card">
                    <div class="plans-title"><h2>{{ winner ? 'Melhores opções' : 'Planos para comparação' }}</h2><span>{{ winner ? 'Em ordem de afinidade com você' : 'Acima do seu orçamento, em ordem de afinidade' }}</span></div>
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
import { getConflictReviewKeys } from './conflict-review.mjs';

const motor = inject('motor');
const config = inject('config');
const trackEvent = createEventDispatcher(config.ga4);
const section = ref('hero');
const step = ref(0);
const answers = ref(motor.createInitialAnswers());
const result = ref(null);
const error = ref('');
const conflicts = ref([]);
const reviewSteps = ref([]);
const locked = ref(false);
const comparisonOpen = ref(false);
const pageElement = ref(null);
const questionSpace = useQuestionSpace(pageElement, motor.questions, motor.getAnswerError);
const transitions = useQuizTransitions(pageElement);
let startedAt = 0;
let shownAt = 0;

const question = computed(() => motor.questions[step.value]);
const reviewing = computed(() => reviewSteps.value.length > 0);
const reviewIndex = computed(() => reviewSteps.value.indexOf(step.value));
const firstQuestion = computed(() => reviewing.value ? reviewIndex.value === 0 : step.value === 0);
const lastQuestion = computed(() => reviewing.value
    ? reviewIndex.value === reviewSteps.value.length - 1 : step.value === motor.questions.length - 1);
const stepLabel = computed(() => {
    if (section.value === 'conflict') return 'Revisão de respostas';
    const original = `Pergunta ${step.value + 1} de ${motor.questions.length}`;
    return reviewing.value ? `Revisão ${reviewIndex.value + 1} de ${reviewSteps.value.length} · ${original}` : original;
});
const nextLabel = computed(() => section.value === 'conflict' ? 'Manter e ver resultado'
    : !lastQuestion.value ? 'Continuar' : reviewing.value ? 'Conferir respostas' : 'Ver resultado');
const validAnswer = computed(() => motor.isAnswerValid(question.value, answers.value[question.value.key]));
const progress = computed(() => section.value === 'conflict' ? 100 : reviewing.value
    ? (reviewIndex.value + 1) / reviewSteps.value.length * 100 : (step.value + 1) / motor.questions.length * 100);
const winner = computed(() => result.value?.winner);
const contract = computed(() => winner.value ? motor.getPlanContract(winner.value.plan) : null);
const displayedPlans = computed(() => result.value ? (winner.value ? result.value.recommendations : result.value.all) : []);
const formatScore = (value) => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const secondsSince = (time) => Math.round((performance.now() - time) / 100) / 10;
const summary = computed(() => {
    if (!result.value) return '';
    if (!winner.value) return `Nenhuma assinatura cabe nos seus ${motor.formatBRL(result.value.budget)}/mês. A mais em conta é ${result.value.cheapest.plan.nome}, por ${motor.formatBRL(result.value.cheapest.pricing.subscription)}/mês. Compare abaixo ou refaça o quiz para ajustar o orçamento.`;
    if (result.value.recommendationReason) return `${winner.value.plan.nome} é o plano indicado para você. ${result.value.recommendationReason}`;
    const scope = result.value.allPlansFit ? 'entre todos os planos' : 'entre os planos que cabem no seu orçamento';
    return `Afinidade estimada de ${formatScore(winner.value.score)} de 100: a maior ${scope}.`;
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
        conflicts.value = [];
        reviewSteps.value = [];
        error.value = '';
        startedAt = performance.now();
        trackEvent('inicio_do_quiz');
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
        trackEvent('resposta_do_quiz', {
            etapa_do_quiz: step.value + 1, pergunta_do_quiz: current.key,
            valor_da_resposta: String(value), rotulo_da_resposta: answerLabel(current, value), tempo_de_resposta_seg: secondsSince(shownAt)
        });
        error.value = '';
        if (reviewing.value) {
            if (!lastQuestion.value && motor.detectConflicts(answers.value).length) {
                step.value = reviewSteps.value[reviewIndex.value + 1];
                return;
            }
        } else if (!lastQuestion.value) { step.value++; return; }
        finishAnswers();
    }, '#resultSummary, #quizTitle');
}
function finishAnswers() {
    reviewSteps.value = [];
    const invalid = motor.validateAnswers(answers.value);
    if (invalid.length) { step.value = invalid[0].index; error.value = invalid[0].message; return; }
    conflicts.value = motor.detectConflicts(answers.value);
    if (conflicts.value.length) section.value = 'conflict';
    else showResults();
}
function back() {
    return changeView(() => {
        if (section.value === 'conflict') {
            const keys = getConflictReviewKeys(motor.questions, conflicts.value, answers.value);
            reviewSteps.value = keys.map(key => motor.questions.findIndex(item => item.key === key));
            if (!reviewSteps.value.length) return;
            section.value = 'quiz';
            step.value = reviewSteps.value[0];
        } else if (reviewing.value) {
            if (reviewIndex.value > 0) step.value = reviewSteps.value[reviewIndex.value - 1];
        } else if (step.value > 0) step.value--;
        error.value = '';
    });
}
function showResults() {
    if (result.value) return;
    result.value = motor.recommendPlans(answers.value);
    section.value = 'results';
    trackEvent('quiz_concluido', {
        plano_recomendado: winner.value?.plan.nome || 'nenhum', indice_de_afinidade: winner.value?.score ?? null,
        compatibilidade: winner.value?.score ?? null, semantica_do_score: 'indice_afinidade_estimado',
        sem_plano_elegivel: Boolean(result.value.noEligible), versao_do_catalogo: motor.CATALOG_VERSION,
        versao_das_regras: result.value.rulesVersion, tempo_total_seg: secondsSince(startedAt),
        ...Object.fromEntries(motor.questions.map((item) => [`resposta_${config.ga4.respostas[item.key]}`, String(answers.value[item.key])]))
    });
}
function restart() {
    return changeView(() => {
        comparisonOpen.value = false;
        result.value = null;
        answers.value = motor.createInitialAnswers();
        conflicts.value = [];
        reviewSteps.value = [];
        error.value = '';
        step.value = 0;
        section.value = 'hero';
    }, '#startButton');
}
function subscribe(plan, location) {
    trackEvent('clique_de_assinatura', {
        plano: plan.nome, plano_recomendado: winner.value?.plan.nome || 'nenhum',
        clicou_no_recomendado: String(plan.slug === winner.value?.plan.slug), local_do_cta: location
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
