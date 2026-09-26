<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ChampionAvatar from './ChampionAvatar.vue'
import { formatDuration, formatRelativeTime } from '../utils/formatMatch'
import { formatMetric } from '../utils/formatMetric'

const props = defineProps({
  match: {
    type: Object,
    required: true,
  },
  dataDragonVersion: {
    type: String,
    default: null,
  },
})

const result = computed(() => {
  if (props.match.remake) {
    return {
      label: 'Remake',
      classes: 'border-slate-600 bg-slate-900 hover:bg-slate-800/80',
      textClass: 'text-slate-300',
    }
  }

  if (props.match.win) {
    return {
      label: 'Victoria',
      classes: 'border-emerald-500 bg-emerald-950/20 hover:bg-emerald-950/35',
      textClass: 'text-emerald-400',
    }
  }

  return {
    label: 'Derrota',
    classes: 'border-rose-500 bg-rose-950/20 hover:bg-rose-950/35',
    textClass: 'text-rose-400',
  }
})
</script>

<template>
  <li>
    <RouterLink
      :to="{ name: 'match-detail', params: { id: match.id } }"
      class="grid gap-5 border-l-4 px-4 py-5 transition sm:grid-cols-[minmax(13rem,1.5fr)_repeat(5,minmax(5rem,0.7fr))] sm:items-center"
      :class="result.classes"
    >
      <div class="flex items-center gap-3">
        <ChampionAvatar :champion="match.champion" :version="dataDragonVersion" />
        <div class="min-w-0">
          <p class="font-semibold text-slate-100">{{ match.champion }}</p>
          <p class="truncate text-sm text-slate-400">{{ match.queue.name }}</p>
          <p class="mt-1 text-xs text-slate-500">
            {{ formatRelativeTime(match.started_at) }} · {{ formatDuration(match.duration_seconds) }}
          </p>
        </div>
      </div>

      <div>
        <p class="text-xs text-slate-500">Resultado</p>
        <p class="mt-1 font-semibold" :class="result.textClass">{{ result.label }}</p>
      </div>
      <div>
        <p class="text-xs text-slate-500">K / D / A</p>
        <p class="mt-1 font-medium text-slate-200">
          {{ match.kills }} / {{ match.deaths }} / {{ match.assists }}
        </p>
      </div>
      <div>
        <p class="text-xs text-slate-500">KDA</p>
        <p class="mt-1 font-medium text-slate-200">{{ formatMetric(match.kda) }}</p>
      </div>
      <div>
        <p class="text-xs text-slate-500">CS</p>
        <p class="mt-1 font-medium text-slate-200">
          {{ formatMetric(match.cs) }} · {{ formatMetric(match.cs_per_min) }}/min
        </p>
      </div>
      <div>
        <p class="text-xs text-slate-500">Daño</p>
        <p class="mt-1 font-medium text-slate-200">
          {{ formatMetric(match.damage_to_champions) }}
        </p>
      </div>
    </RouterLink>
  </li>
</template>
