<script setup>
import { computed } from 'vue'
import { formatMetric } from '../utils/formatMetric'

const props = defineProps({
  rank: {
    type: Object,
    required: true,
  },
})

const platformName = computed(() => {
  const platforms = {
    la1: 'LAN',
    la2: 'LAS',
  }

  return platforms[props.rank.platform] ?? props.rank.platform
})

const queueName = computed(() => {
  const queues = {
    RANKED_SOLO_5x5: 'Solo/Dúo',
    RANKED_FLEX_SR: 'Flexible',
  }

  return queues[props.rank.queue_type] ?? props.rank.queue_type
})
</script>

<template>
  <article class="rounded-xl border border-line bg-card p-5">
    <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-5">
      <div>
        <dt class="text-fg-muted">Plataforma</dt>
        <dd class="mt-1 font-semibold text-fg">{{ platformName }}</dd>
      </div>
      <div>
        <dt class="text-fg-muted">Cola</dt>
        <dd class="mt-1 font-semibold text-fg">{{ queueName }}</dd>
      </div>
      <div>
        <dt class="text-fg-muted">Liga</dt>
        <dd class="mt-1 font-semibold text-fg">{{ rank.tier }}</dd>
      </div>
      <div>
        <dt class="text-fg-muted">División</dt>
        <dd class="mt-1 font-semibold text-fg">{{ rank.rank }}</dd>
      </div>
      <div>
        <dt class="text-fg-muted">LP</dt>
        <dd class="mt-1 font-semibold text-accent">
          {{ formatMetric(rank.league_points) }}
        </dd>
      </div>
    </dl>
  </article>
</template>
