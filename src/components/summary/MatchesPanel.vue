<script setup>
import { computed, useId } from 'vue'
import { formatMetric } from '../../utils/formatMetric'
import { getProgressPercent } from '../../utils/summaryFormat'

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

const titleId = useId()
const winProgress = computed(() => getProgressPercent(props.wins, props.games))
const hasGames = computed(() => Number.isFinite(props.games) && props.games > 0)
const progressLabel = computed(
  () => `${formatMetric(props.wins)} victorias de ${formatMetric(props.games)} partidas`,
)
</script>

<template>
  <section
    :aria-labelledby="titleId"
    class="flex flex-col gap-4 rounded-2xl bg-surface p-6 text-ink shadow-card"
  >
    <h2
      :id="titleId"
      class="text-base font-semibold"
    >
      Partidas
    </h2>

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

    <div
      class="flex h-3 overflow-hidden rounded-full"
      role="img"
      :aria-label="progressLabel"
    >
      <template v-if="hasGames">
        <span
          aria-hidden="true"
          class="bg-win"
          :style="{ width: `${winProgress}%` }"
        ></span>
        <span
          aria-hidden="true"
          class="flex-1 bg-loss"
        ></span>
      </template>
      <span
        v-else
        aria-hidden="true"
        class="flex-1 bg-surface-muted"
      ></span>
    </div>
  </section>
</template>
