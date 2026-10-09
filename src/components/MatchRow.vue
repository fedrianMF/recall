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
      classes: 'border-line-strong bg-card hover:bg-card-raised/80',
      textClass: 'text-fg-soft',
    }
  }

  if (props.match.win) {
    return {
      label: 'Victoria',
      classes: 'border-success-solid bg-success-soft/20 hover:bg-success-soft/35',
      textClass: 'text-success',
    }
  }

  return {
    label: 'Derrota',
    classes: 'border-danger-solid bg-danger-soft/20 hover:bg-danger-soft/35',
    textClass: 'text-danger',
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
        <ChampionAvatar
          :champion="match.champion"
          :version="dataDragonVersion"
        />
        <div class="min-w-0">
          <p class="font-semibold text-fg">{{ match.champion }}</p>
          <p class="truncate text-sm text-fg-muted">{{ match.queue.name }}</p>
          <p class="mt-1 text-xs text-fg-subtle">
            {{ formatRelativeTime(match.started_at) }} ·
            {{ formatDuration(match.duration_seconds) }}
          </p>
        </div>
      </div>

      <div>
        <p class="text-xs text-fg-subtle">Resultado</p>
        <p
          class="mt-1 font-semibold"
          :class="result.textClass"
        >
          {{ result.label }}
        </p>
      </div>
      <div>
        <p class="text-xs text-fg-subtle">K / D / A</p>
        <p class="mt-1 font-medium text-fg">
          {{ match.kills }} / {{ match.deaths }} / {{ match.assists }}
        </p>
      </div>
      <div>
        <p class="text-xs text-fg-subtle">KDA</p>
        <p class="mt-1 font-medium text-fg">{{ formatMetric(match.kda) }}</p>
      </div>
      <div>
        <p class="text-xs text-fg-subtle">CS</p>
        <p class="mt-1 font-medium text-fg">
          {{ formatMetric(match.cs) }} · {{ formatMetric(match.cs_per_min) }}/min
        </p>
      </div>
      <div>
        <p class="text-xs text-fg-subtle">Daño</p>
        <p class="mt-1 font-medium text-fg">
          {{ formatMetric(match.damage_to_champions) }}
        </p>
      </div>
    </RouterLink>
  </li>
</template>
