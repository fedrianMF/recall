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
  <article class="rounded-xl border border-slate-800 bg-slate-900 p-5">
    <p class="text-sm font-medium text-slate-400">{{ label }}</p>
    <p class="mt-2 text-3xl font-semibold tracking-tight text-slate-100">
      {{ formatMetric(value, suffix) }}
    </p>
  </article>
</template>
