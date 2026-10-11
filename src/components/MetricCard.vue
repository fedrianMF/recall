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
  <article class="rounded-metric bg-surface p-5 shadow-card">
    <p class="text-sm font-medium text-ink-muted">{{ label }}</p>
    <p class="mt-2 font-display text-3xl font-bold tracking-tight text-ink tabular-nums">
      {{ formatMetric(value, suffix) }}
    </p>
  </article>
</template>
