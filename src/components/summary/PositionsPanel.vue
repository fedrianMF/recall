<script setup>
import { computed } from 'vue'
import { formatPosition, getPositionLabel, sortPositionsByGames } from '../../utils/positions'
import { formatMetric } from '../../utils/formatMetric'
import SummaryErrorPanel from './SummaryErrorPanel.vue'
import SummaryPanel from './SummaryPanel.vue'
import WinLossBar from './WinLossBar.vue'

const props = defineProps({
  // Entries of the positions endpoint.
  positions: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Error,
    default: null,
  },
})

defineEmits(['retry'])

// sortPositionsByGames returns a new array, so the prop is never mutated.
const sortedPositions = computed(() => sortPositionsByGames(props.positions))
// Losses are not in the contract: games minus wins, or null if either is unknown.
function getLosses(item) {
  return Number.isFinite(item.games) && Number.isFinite(item.wins)
    ? formatMetric(item.games - item.wins)
    : formatMetric(null)
}

const hasData = computed(() => sortedPositions.value.length > 0)
</script>

<template>
  <SummaryPanel title="Rendimiento por posición">
    <SummaryErrorPanel
      v-if="error"
      title="No se pudieron cargar las posiciones"
      :heading-level="3"
      :message="error.message"
      @retry="$emit('retry')"
    />

    <ul
      v-if="hasData"
      class="flex flex-col gap-4"
    >
      <li
        v-for="item in sortedPositions"
        :key="item.position"
        class="flex flex-col gap-2"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-ink">{{ formatPosition(item.position) }}</p>
            <p class="text-sm text-ink-muted">
              {{ item.games }} {{ item.games === 1 ? 'partida' : 'partidas' }}
            </p>
          </div>
          <div class="text-right">
            <p class="font-display tabular-nums">{{ formatMetric(item.winrate, '%') }}</p>
            <p class="text-sm text-ink-muted">KDA {{ formatMetric(item.kda) }}</p>
          </div>
        </div>

        <WinLossBar
          :wins="item.wins"
          :total="item.games"
          :label="getPositionLabel(item)"
          size="sm"
        />

        <p class="text-sm text-ink-muted tabular-nums">
          <span aria-hidden="true">✓</span> {{ formatMetric(item.wins) }} V ·
          <span aria-hidden="true">✕</span> {{ getLosses(item) }} D
        </p>
      </li>
    </ul>

    <div
      v-else-if="isLoading && !error"
      role="status"
      class="flex flex-col gap-4"
    >
      <span class="sr-only">Cargando posiciones…</span>
      <div
        v-for="index in 3"
        :key="index"
        aria-hidden="true"
        class="h-12 animate-pulse motion-reduce:animate-none rounded-control bg-surface-muted"
      ></div>
    </div>

    <p
      v-else-if="!error"
      class="text-sm text-ink-muted"
    >
      Aún no hay partidas con posición registrada.
    </p>
  </SummaryPanel>
</template>
