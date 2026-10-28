<template>
    <div class="options" id="options">
        <div v-if="question.type === 'range'" class="range-wrap">
            <div class="range-value">
                <span>{{ question.help || 'Sua estimativa' }}</span>
                <strong id="rangeOutput">{{ unknown ? question.unknownLabel : `${rangeValue} ${question.suffix}` }}</strong>
            </div>
            <input id="rangeInput" type="range" :min="question.min" :max="question.max"
                :value="rangeValue" :disabled="unknown" :aria-label="question.title"
                @input="emit('answer', Number($event.target.value))">
            <label v-if="question.allowUnknown" class="unknown-option">
                <input type="checkbox" id="unknownToggle" :checked="unknown"
                    @change="emit('answer', $event.target.checked ? 'unknown' : rangeValue)">
                {{ question.unknownLabel }}
            </label>
        </div>
        <template v-else>
            <button v-for="(option, index) in question.options" :key="index" type="button"
                class="option" :class="{ selected: Object.is(value, option.value) }"
                :data-option-index="index" :aria-pressed="String(Object.is(value, option.value))"
                @click="emit('answer', option.value)">
                <span class="option-label">{{ option.label }}</span>
                <span v-if="option.description" class="option-description">{{ option.description }}</span>
            </button>
        </template>
    </div>
</template>
<script setup>
import { computed } from 'vue';
const props = defineProps({ question: { type: Object, required: true }, value: { required: true } });
const emit = defineEmits(['answer']);
const unknown = computed(() => props.value === 'unknown');
const rangeValue = computed(() => typeof props.value === 'number' ? props.value : props.question.min);
</script>
