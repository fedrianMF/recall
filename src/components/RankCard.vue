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
  <article class="rounded-xl border border-slate-800 bg-slate-900 p-5">
    <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-5">
      <div>
        <dt class="text-slate-400">Plataforma</dt>
        <dd class="mt-1 font-semibold text-slate-100">{{ platformName }}</dd>
      </div>
      <div>
        <dt class="text-slate-400">Cola</dt>
        <dd class="mt-1 font-semibold text-slate-100">{{ queueName }}</dd>
      </div>
      <div>
        <dt class="text-slate-400">Liga</dt>
        <dd class="mt-1 font-semibold text-slate-100">{{ rank.tier }}</dd>
      </div>
      <div>
        <dt class="text-slate-400">División</dt>
        <dd class="mt-1 font-semibold text-slate-100">{{ rank.rank }}</dd>
      </div>
      <div>
        <dt class="text-slate-400">LP</dt>
        <dd class="mt-1 font-semibold text-cyan-400">
          {{ formatMetric(rank.league_points) }}
        </dd>
      </div>
    </dl>
  </article>
</template>
