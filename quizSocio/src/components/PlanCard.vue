<template>
    <article class="plan" :id="`plan-${plan.slug}`">
        <div class="result-badge">{{ badge }}</div>
        <div class="result-plan">
            <img :src="plan.logo" :alt="`Logo do plano ${plan.nome}`">
            <div><p class="result-price">{{ contract.priceText }}</p><small>{{ contract.totalText }}</small></div>
        </div>
        <div class="plan-content">
            <p class="plan-fee">{{ evaluation.pricing.adhesion ? `Taxa única de adesão de ${motor.formatBRL(evaluation.pricing.adhesion)}, à parte` : 'Sem taxa de adesão' }}</p>
            <ul class="benefits-list"><li v-for="benefit in motor.getPlanBenefits(plan, answers)" :key="benefit">{{ benefit }}</li></ul>
            <p v-if="evaluation.sectorFit.level !== 'full'" class="plan-sector-note">Atenção ao setor: {{ evaluation.sectorFit.text }}</p>
        </div>
        <div class="plan-score">{{ scoreNote }}</div>
        <a :href="evaluation.eligibility.withinBudget ? plan.contratacao.link : undefined"
            :aria-disabled="evaluation.eligibility.withinBudget ? undefined : 'true'"
            target="_blank" rel="noopener noreferrer" class="plan-cta" :data-plan="plan.nome"
            @click="subscribe">{{ motor.getCTAText(plan, answers) }}</a>
    </article>
</template>
<script setup>
import { computed, inject } from 'vue';
const props = defineProps({ evaluation: Object, index: Number, result: Object, answers: Object });
const emit = defineEmits(['subscribe']);
const motor = inject('motor');
const plan = computed(() => props.evaluation.plan);
const contract = computed(() => motor.getPlanContract(plan.value));
const badge = computed(() => !props.evaluation.eligibility.withinBudget ? 'Acima do orçamento'
    : props.index === 0 ? 'Recomendado' : 'Outra opção');
const scoreNote = computed(() => !props.evaluation.eligibility.withinBudget ? 'Acima do seu orçamento'
    : props.index === 0 ? 'Indicado para o seu perfil' : 'Compare os benefícios com o plano indicado');
function subscribe(event) {
    if (!event.currentTarget.hasAttribute('href')) return event.preventDefault();
    emit('subscribe', plan.value, 'lista');
}
</script>
