<script setup>
import { formatMetric } from '../utils/formatMetric'

defineProps({
  games: {
    type: Number,
    default: null,
  },
  wins: {
    type: Number,
    default: null,
  },
  losses: {
    type: Number,
    default: null,
  },
})
</script>

<template>
  <section class="rounded-xl border border-line bg-card p-5">
    <h3 class="text-sm font-medium text-fg-muted">Partidas jugadas</h3>

    <div class="mt-4 flex flex-wrap items-end gap-x-10 gap-y-4">
      <p class="text-4xl font-semibold tracking-tight text-fg">
        {{ formatMetric(games) }}
      </p>

      <dl class="flex gap-8 text-sm">
        <div>
          <dt class="text-fg-muted">Victorias</dt>
          <dd class="mt-1 text-lg font-semibold text-success">{{ formatMetric(wins) }}</dd>
        </div>
        <div>
          <dt class="text-fg-muted">Derrotas</dt>
          <dd class="mt-1 text-lg font-semibold text-danger">{{ formatMetric(losses) }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
