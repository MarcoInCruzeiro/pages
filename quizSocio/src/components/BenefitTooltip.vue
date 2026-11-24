<template>
    <span class="benefit-tooltip">
        <button ref="trigger" type="button" class="benefit-tooltip-trigger"
            :aria-label="`${summary}. Detalhes do benefício de ingresso do ${planName}`"
            :aria-describedby="id" :aria-expanded="String(open)"
            @pointerenter="enterTrigger" @pointerleave="leaveTrigger"
            @focus="show" @blur="close" @click="toggle">
            <span>{{ summary }}</span><span class="benefit-tooltip-icon" aria-hidden="true">i</span>
        </button>
        <span ref="tooltip" :id="id" role="tooltip" popover="manual" class="benefit-tooltip-content"
            @pointerenter="cancelHide" @pointerleave="scheduleHide" @toggle="syncOpen">
            <slot />
        </span>
    </span>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

defineProps({ id: String, summary: String, planName: String });
const trigger = ref(null);
const tooltip = ref(null);
const open = ref(false);
let pinned = false;
let hideTimer;

function cancelHide() {
    clearTimeout(hideTimer);
}
function close() {
    cancelHide();
    pinned = false;
    tooltip.value?.hidePopover();
    open.value = false;
}
function position() {
    if (!open.value) return;
    const anchor = trigger.value.getBoundingClientRect();
    const bubble = tooltip.value.getBoundingClientRect();
    const margin = 12;
    const gap = 8;
    const left = Math.max(margin, Math.min(anchor.left + (anchor.width - bubble.width) / 2,
        window.innerWidth - bubble.width - margin));
    const below = anchor.bottom + gap;
    const top = below + bubble.height <= window.innerHeight - margin
        ? below : Math.max(margin, anchor.top - bubble.height - gap);
    Object.assign(tooltip.value.style, { left: `${left}px`, top: `${top}px` });
}
function show() {
    cancelHide();
    for (const other of document.querySelectorAll('.benefit-tooltip-content:popover-open')) {
        if (other !== tooltip.value) other.hidePopover();
    }
    tooltip.value.showPopover();
    open.value = true;
    position();
}
function syncOpen() {
    open.value = tooltip.value.matches(':popover-open');
    if (!open.value) pinned = false;
}
function toggle() {
    if (pinned) close();
    else { pinned = true; show(); }
}
function enterTrigger(event) {
    if (event.pointerType === 'mouse') show();
}
function leaveTrigger() {
    scheduleHide();
}
function scheduleHide() {
    if (pinned || document.activeElement === trigger.value) return;
    cancelHide();
    hideTimer = setTimeout(close, 120);
}
function onPointerDown(event) {
    if (open.value && !trigger.value.contains(event.target) && !tooltip.value.contains(event.target)) close();
}
function onKey(event) {
    if (!open.value || event.key !== 'Escape') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    close();
}
onMounted(() => {
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
});
onBeforeUnmount(() => {
    close();
    document.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('scroll', position, true);
    window.removeEventListener('resize', position);
});
</script>
