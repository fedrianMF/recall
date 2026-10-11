<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 0-100, already clamped by the parent.
  percent: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value),
  },
})

const heightClass = computed(() => (props.size === 'sm' ? 'h-1.5' : 'h-2'))
</script>

<template>
  <div
    class="rounded-full bg-sky-soft"
    :class="heightClass"
    role="img"
    :aria-label="label"
  >
    <div
      class="rounded-full bg-sky"
      :class="heightClass"
      :style="{ width: `${percent}%` }"
    ></div>
  </div>
</template>
