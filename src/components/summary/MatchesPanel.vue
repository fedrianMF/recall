<script setup>
import { computed } from 'vue'
import { formatMetric } from '../../utils/formatMetric'
import SummaryPanel from './SummaryPanel.vue'
import WinLossBar from './WinLossBar.vue'

const props = defineProps({
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

const progressLabel = computed(
  () => `${formatMetric(props.wins)} victorias de ${formatMetric(props.games)} partidas`,
)
</script>

<template>
  <SummaryPanel title="Partidas">
    <div class="flex items-end justify-between gap-5">
      <p class="font-display text-[48px] leading-none font-bold tracking-tight tabular-nums">
        {{ formatMetric(games) }}
      </p>

      <div class="grid grid-cols-2 gap-5">
        <div class="space-y-1">
          <p class="inline-flex items-center gap-1 text-xs font-semibold text-win-text">
            <span aria-hidden="true">✓</span>
            Victorias
          </p>
          <p class="font-display text-2xl font-bold tabular-nums text-win">
            {{ formatMetric(wins) }}
          </p>
        </div>
        <div class="space-y-1">
          <p class="inline-flex items-center gap-1 text-xs font-semibold text-loss-text">
            <span aria-hidden="true">✕</span>
            Derrotas
          </p>
          <p class="font-display text-2xl font-bold tabular-nums text-loss">
            {{ formatMetric(losses) }}
          </p>
        </div>
      </div>
    </div>

    <WinLossBar
      :wins="wins"
      :total="games"
      :label="progressLabel"
      size="md"
    />
  </SummaryPanel>
</template>
