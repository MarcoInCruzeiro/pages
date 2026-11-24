<template>
    <div class="options" :id="`${idPrefix}options`">
        <div v-if="question.type === 'range'" class="range-wrap">
            <div class="range-value">
                <span>{{ question.help || 'Sua estimativa' }}</span>
                <strong :id="`${idPrefix}rangeOutput`">{{ unknown ? question.unknownLabel : `${rangeValue} ${question.suffix}` }}</strong>
            </div>
            <input :id="`${idPrefix}rangeInput`" type="range" :min="question.min" :max="question.max"
                :value="rangeValue" :disabled="unknown" :aria-label="question.title"
                @input="emit('answer', Number($event.target.value))">
            <label v-if="question.allowUnknown" class="unknown-option">
                <input type="checkbox" :id="`${idPrefix}unknownToggle`" :checked="unknown"
                    @change="emit('answer', $event.target.checked ? 'unknown' : rangeValue)">
                {{ question.unknownLabel }}
            </label>
        </div>
        <template v-else>
            <button v-for="(option, index) in question.options" :key="index" type="button"
                class="option" :class="{ selected: Object.is(value, option.value) }"
                :data-option-index="index" :aria-pressed="String(Object.is(value, option.value))"
                @click="emit('answer', option.value)">
                <strong class="option-label">{{ option.label }}</strong>
                <span v-if="option.description" class="option-description">{{ option.description }}</span>
            </button>
        </template>
    </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue';
const props = defineProps({ question: { type: Object, required: true }, value: { required: true }, idPrefix: { type: String, default: '' } });
const emit = defineEmits(['answer']);
// Disabling the slider must not discard the quantity entered before "unknown".
const lastQuantity = ref(typeof props.value === 'number' ? props.value : props.question.min);
watch(() => props.value, (value) => {
    if (typeof value === 'number') lastQuantity.value = value;
}, { flush: 'sync' });
const unknown = computed(() => props.value === 'unknown');
const rangeValue = computed(() => typeof props.value === 'number' ? props.value : lastQuantity.value);
</script>
