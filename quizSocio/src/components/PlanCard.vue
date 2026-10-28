<template>
    <article class="plan" :id="`plan-${plan.slug}`">
        <div class="result-badge">{{ badge }}</div>
        <div class="result-plan">
            <img :src="plan.logo" :alt="`Logo do plano ${plan.nome}`">
            <div><p class="result-price">{{ contract.priceText }}</p><small>{{ contract.detail }}</small></div>
        </div>
        <div class="plan-content">
            <p class="plan-fee">{{ evaluation.pricing.adhesion ? `Taxa única de adesão: ${motor.formatBRL(evaluation.pricing.adhesion)} (cobrada separadamente)` : 'Sem taxa de adesão' }}</p>
            <ul class="benefits-list"><li v-for="benefit in motor.getPlanBenefits(plan, answers)" :key="benefit">{{ benefit }}</li></ul>
            <p v-if="evaluation.sectorFit.level === 'partial'" class="plan-sector-note">Cobre parte do setor {{ evaluation.sectorFit.label }}.</p>
            <p v-if="evaluation.sectorFit.level === 'none'" class="plan-sector-note">Não cobre {{ evaluation.sectorFit.label }}.</p>
        </div>
        <div class="plan-score">{{ score(evaluation.score) }} de 100 de afinidade estimada{{ scoreNote }}</div>
        <a :href="evaluation.eligibility.withinBudget ? plan.contratacao.link : undefined"
            :aria-disabled="evaluation.eligibility.withinBudget ? undefined : 'true'"
            target="_blank" rel="noopener noreferrer" class="plan-cta" :data-plan="plan.nome"
            @click="subscribe">{{ motor.getCTAText(plan) }}</a>
    </article>
</template>
<script setup>
import { computed, inject } from 'vue';
const props = defineProps({ evaluation: Object, index: Number, result: Object, answers: Object });
const emit = defineEmits(['subscribe']);
const motor = inject('motor');
const plan = computed(() => props.evaluation.plan);
const contract = computed(() => motor.getPlanContract(plan.value));
const score = (value) => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const badge = computed(() => !props.evaluation.eligibility.withinBudget ? 'Acima do orçamento'
    : props.index === 0 ? 'Recomendado' : props.index === 1 && props.result.closeCall ? 'Também recomendado' : 'Alternativo');
const pointsBehind = computed(() => props.result.winner
    ? Math.round((props.result.winner.score - props.evaluation.score) * 10) / 10 : null);
const scoreNote = computed(() => !props.evaluation.eligibility.withinBudget ? ' · acima do orçamento de assinatura'
    : props.index === 0 ? ' · maior afinidade estimada'
        : ` · ${score(pointsBehind.value)} ${pointsBehind.value === 1 ? 'ponto' : 'pontos'} abaixo do recomendado`);
function subscribe(event) {
    if (!event.currentTarget.hasAttribute('href')) return event.preventDefault();
    emit('subscribe', plan.value, 'lista');
}
</script>
