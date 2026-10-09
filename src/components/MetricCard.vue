<script setup>
import { formatMetric } from '../utils/formatMetric'

defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    default: null,
  },
  suffix: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <article class="rounded-xl border border-line bg-card p-5">
    <p class="text-sm font-medium text-fg-muted">{{ label }}</p>
    <p class="mt-2 text-3xl font-semibold tracking-tight text-fg">
      {{ formatMetric(value, suffix) }}
    </p>
  </article>
</template>
