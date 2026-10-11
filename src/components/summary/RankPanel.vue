<script setup>
import { computed, useId } from 'vue'
import { formatMetric } from '../../utils/formatMetric'
import {
  formatPlatform,
  formatQueueType,
  formatTier,
  getProgressPercent,
  isApexTier,
} from '../../utils/summaryFormat'

// Riot ladders show at most 100 LP per division.
const LP_TOTAL = 100

const props = defineProps({
  // One entry of summary.ranks, or null when the account has no ranked league.
  rank: {
    type: Object,
    default: null,
  },
})

const titleId = useId()
const tierName = computed(() => formatTier(props.rank?.tier, props.rank?.rank))
// Apex LP can pass 100, so a "x / 100" label and bar would be wrong there.
const isApex = computed(() => isApexTier(props.rank?.tier))
const lpProgress = computed(() => getProgressPercent(props.rank?.league_points, LP_TOTAL))
const lpLabel = computed(() => `${formatMetric(props.rank?.league_points)} de ${LP_TOTAL} LP`)
const details = computed(() => [
  { label: 'Plataforma', value: formatPlatform(props.rank?.platform) },
  { label: 'Cola', value: formatQueueType(props.rank?.queue_type) },
  { label: 'Liga', value: formatMetric(props.rank?.tier) },
  { label: 'División', value: formatMetric(props.rank?.rank) },
])
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
      Rango
    </h2>

    <template v-if="rank">
      <div class="flex items-center gap-4">
        <svg
          class="size-14 shrink-0"
          viewBox="0 0 48 48"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M24 3l18 10.5v21L24 45 6 34.5v-21z"
            class="fill-gold-soft stroke-gold"
            stroke-width="2"
          />
          <path
            d="M15 21l9-6 9 6M15 30l9-6 9 6"
            fill="none"
            class="stroke-gold-text"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <div class="flex flex-1 flex-col gap-2">
          <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p class="font-display text-[28px] leading-tight font-bold tracking-tight">
              {{ tierName }}
            </p>
            <p class="text-[15px] font-semibold tabular-nums">
              {{ formatMetric(rank.league_points) }}
              <span class="font-normal text-ink-muted">
                <template v-if="!isApex">/ {{ LP_TOTAL }}</template>
                LP
              </span>
            </p>
          </div>
          <div
            v-if="!isApex"
            class="h-2 rounded-full bg-sky-soft"
            role="img"
            :aria-label="lpLabel"
          >
            <div
              class="h-2 rounded-full bg-sky"
              :style="{ width: `${lpProgress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <dl
        class="grid grid-cols-2 gap-x-3 gap-y-3.5 border-t border-divider pt-4 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
      >
        <div
          v-for="item in details"
          :key="item.label"
          class="flex flex-col gap-1"
        >
          <dt class="text-xs text-ink-muted">{{ item.label }}</dt>
          <dd class="text-[15px] font-semibold">{{ item.value }}</dd>
        </div>
      </dl>
    </template>

    <div
      v-else
      class="space-y-1"
    >
      <p class="font-display text-[28px] leading-tight font-bold tracking-tight">Sin rango</p>
      <p class="text-sm text-ink-muted">Aún no hay una liga clasificatoria registrada.</p>
    </div>
  </section>
</template>
