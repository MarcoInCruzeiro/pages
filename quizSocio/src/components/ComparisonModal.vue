<template>
    <div class="modal-overlay" :class="{ 'is-open': open }" id="comparisonModal"
        role="dialog" :aria-modal="open ? 'true' : undefined" :aria-hidden="String(!open)"
        aria-label="Comparativo de planos" @click.self="emit('close')">
        <div class="modal-content">
            <button class="modal-close" id="modalClose" type="button" aria-label="Fechar" @click="emit('close')">&times;</button>
            <h2 class="modal-title">Comparativo de planos</h2>
            <p class="modal-hint">Deslize para o lado para comparar os quatro planos.</p>
            <div class="modal-body" id="modalComparisonBody">
                <div v-if="result" class="comparison-wrapper">
                    <table class="comparison-table">
                        <thead><tr>
                            <th class="comparison-feature-label">Planos</th>
                            <th v-for="plan in motor.plans" :key="plan.slug" :class="highlight(plan)">
                                <h2 class="plan-name">{{ plan.nome }}</h2>
                                <span v-if="badge(plan)" class="plan-badge">{{ badge(plan) }}</span>
                            </th>
                        </tr></thead>
                        <tbody>
                            <tr v-for="feature in features" :key="feature.label">
                                <td class="comparison-feature-label">{{ feature.label }}</td>
                                <td v-for="plan in motor.plans" :key="plan.slug" :class="highlight(plan)">
                                    <span class="comparison-detail">{{ feature.value(plan) }}</span>
                                </td>
                            </tr>
                            <tr><td class="comparison-feature-label">Afinidade estimada</td>
                                <td v-for="plan in motor.plans" :key="plan.slug" class="comparison-compatibility" :class="highlight(plan)">
                                    {{ formatScore(evaluated(plan)?.score) }} de 100
                                </td>
                            </tr>
                        </tbody>
                        <tfoot><tr><td class="comparison-feature-label"></td>
                            <td v-for="plan in motor.plans" :key="plan.slug" :class="highlight(plan)">
                                <a :href="plan.contratacao.link" target="_blank" rel="noopener noreferrer"
                                    class="plan-cta" :data-plan="plan.nome" @click="emit('subscribe', plan, 'comparativo')">
                                    {{ motor.getCTAText(plan) }}
                                </a>
                            </td>
                        </tr></tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { inject, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
const props = defineProps({ open: Boolean, result: Object, answers: Object });
const emit = defineEmits(['close', 'subscribe']);
const motor = inject('motor');
const formatScore = (value) => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const evaluated = (plan) => props.result?.all.find((item) => item.plan.slug === plan.slug);
const highlight = (plan) => plan.slug === props.result?.winner?.plan.slug ? 'comparison-highlight' : '';
function badge(plan) {
    if (plan.slug === props.result?.winner?.plan.slug) return 'Recomendado';
    if (props.result?.closeCall && plan.slug === props.result.runnerUp?.plan.slug) return 'Também recomendado';
    if (!evaluated(plan)?.eligibility.withinBudget) return 'Acima do orçamento';
    return '';
}
const features = computed(() => [
    { label: 'Contratação', value: (plan) => motor.getPlanContract(plan).detail },
    { label: 'Preço', value: (plan) => `${motor.getPlanContract(plan).priceText}\n${motor.getPlanContract(plan).totalText}` },
    { label: 'Taxa de adesão', value: (plan) => plan.contratacao.taxaAdesao ? `${motor.formatBRL(plan.contratacao.taxaAdesao)} (única)` : 'Sem taxa' },
    { label: 'Benefício de ingresso', value: (plan) => {
        const ticket = motor.getTicketBenefit(plan, props.answers);
        return `✓ ${ticket.text}\nSetores: ${ticket.setorTexto}`;
    } },
    { label: 'Prioridade / garantia', value: (plan) => motor.getPriority(plan, props.answers).label },
    { label: 'Desconto na loja', value: (plan) => `✓ ${plan.loja.texto}` },
    { label: 'Conteúdo e votação', value: (plan) => plan.conteudoExclusivo && plan.votacao ? '✓' : '✗' },
    { label: 'Kids', value: (plan) => plan.opcionais.kids.disponivel ? `✓ ${motor.formatBRL(plan.opcionais.kids.precoMensal)}/mês por criança (até ${plan.opcionais.kids.maxCriancas})` : '✗' }
]);
let returnFocus;
let previousOverflow = '';
watch(() => props.open, async (opened) => {
    if (opened) {
        returnFocus = document.activeElement;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        await nextTick();
        document.getElementById('modalClose')?.focus();
    } else {
        document.body.style.overflow = previousOverflow;
        if (returnFocus?.isConnected) returnFocus.focus();
        returnFocus = null;
    }
}, { flush: 'post' });
function onKey(event) {
    if (!props.open) return;
    if (event.key === 'Escape') emit('close');
    if (event.key !== 'Tab') return;
    const focusable = [...document.querySelectorAll('#comparisonModal button, #comparisonModal a[href]')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
}
onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKey);
    if (props.open) document.body.style.overflow = previousOverflow;
});
</script>
