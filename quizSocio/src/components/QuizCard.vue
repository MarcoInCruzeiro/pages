<template>
    <section class="quiz-card dynamic-section is-entering" :aria-labelledby="`${idPrefix}quizTitle`">
        <div class="progress" aria-hidden="true"><div class="progress-bar" :id="`${idPrefix}progressBar`" :style="{ width: progress + '%' }"></div></div>
        <div class="step-info"><span :id="`${idPrefix}stepCounter`">{{ stepLabel }}</span></div>
        <h2 class="question" :id="`${idPrefix}quizTitle`" tabindex="-1">{{ title }}</h2>
        <slot />
        <p class="field-error" :id="`${idPrefix}fieldError`" role="alert" :hidden="!error">{{ error }}</p>
        <div class="quiz-actions">
            <button class="btn btn-secondary" :id="`${idPrefix}backButton`" type="button" :disabled="backDisabled" @click="$emit('back')">{{ backLabel }}</button>
            <button class="btn btn-primary" :id="`${idPrefix}nextButton`" type="button" :disabled="nextDisabled" @click="$emit('next')">{{ nextLabel }}</button>
        </div>
    </section>
</template>
<script setup>
defineProps({
    title: String, stepLabel: String, progress: Number, error: { type: String, default: '' },
    backLabel: { type: String, default: 'Voltar' }, nextLabel: { type: String, default: 'Continuar' },
    backDisabled: Boolean, nextDisabled: Boolean, idPrefix: { type: String, default: '' }
});
defineEmits(['back', 'next']);
</script>
