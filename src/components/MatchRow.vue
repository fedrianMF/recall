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
      classes: 'border-divider bg-surface hover:bg-surface-muted',
      textClass: 'text-ink-muted',
    }
  }

  if (props.match.win) {
    return {
      label: 'Victoria',
      classes: 'border-win bg-surface hover:bg-win-soft/40',
      textClass: 'text-win-text',
    }
  }

  return {
    label: 'Derrota',
    classes: 'border-loss bg-surface hover:bg-loss-soft/40',
    textClass: 'text-loss-text',
  }
})
</script>

<template>
  <li>
    <RouterLink
      :to="{ name: 'match-detail', params: { id: match.id } }"
      class="grid grid-cols-2 gap-5 border-l-4 px-4 py-5 transition-colors sm:grid-cols-3 lg:grid-cols-[minmax(13rem,1.5fr)_repeat(5,minmax(5rem,0.7fr))] lg:items-center"
      :class="result.classes"
    >
      <div class="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-3 lg:col-span-1">
        <ChampionAvatar
          :champion="match.champion"
          :version="dataDragonVersion"
        />
        <div class="min-w-0">
          <p class="font-semibold text-ink">{{ match.champion }}</p>
          <p class="truncate text-sm text-ink-muted">{{ match.queue.name }}</p>
          <p class="mt-1 text-xs text-ink-muted">
            {{ formatRelativeTime(match.started_at) }} ·
            {{ formatDuration(match.duration_seconds) }}
          </p>
        </div>
      </div>

      <div>
        <p class="text-xs text-ink-muted">Resultado</p>
        <p
          class="mt-1 font-semibold"
          :class="result.textClass"
        >
          {{ result.label }}
        </p>
      </div>
      <div>
        <p class="text-xs text-ink-muted">K / D / A</p>
        <p class="mt-1 font-medium text-ink">
          {{ match.kills }} / {{ match.deaths }} / {{ match.assists }}
        </p>
      </div>
      <div>
        <p class="text-xs text-ink-muted">KDA</p>
        <p class="mt-1 font-medium text-ink">{{ formatMetric(match.kda) }}</p>
      </div>
      <div>
        <p class="text-xs text-ink-muted">CS</p>
        <p class="mt-1 font-medium text-ink">
          {{ formatMetric(match.cs) }} · {{ formatMetric(match.cs_per_min) }}/min
        </p>
      </div>
      <div>
        <p class="text-xs text-ink-muted">Daño</p>
        <p class="mt-1 font-medium text-ink">
          {{ formatMetric(match.damage_to_champions) }}
        </p>
      </div>
    </RouterLink>
  </li>
</template>
