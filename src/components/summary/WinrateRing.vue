<script setup>
import { computed } from 'vue'
import { getWinrateLabel } from '../../utils/summaryFormat'
import { getWinrateRing } from '../../utils/winrateRing'

const props = defineProps({
  winrate: {
    type: Number,
    default: null,
  },
  wins: {
    type: Number,
    required: true,
  },
  losses: {
    type: Number,
    required: true,
  },
})

const ring = computed(() => getWinrateRing(props.winrate, { radius: 106, gap: 3 }))

const accessibleLabel = computed(() =>
  getWinrateLabel({
    winrate: props.winrate,
    wins: props.wins,
    losses: props.losses,
  }),
)
</script>

<template>
  <div class="relative aspect-square w-full max-w-[232px]">
    <svg
      class="block h-full w-full"
      viewBox="0 0 232 232"
      role="img"
      :aria-label="accessibleLabel"
    >
      <g
        v-if="ring"
        aria-hidden="true"
        transform="rotate(-90 116 116)"
      >
        <circle
          class="stroke-win"
          cx="116"
          cy="116"
          r="106"
          fill="none"
          stroke-width="20"
          stroke-linecap="butt"
          :stroke-dasharray="`${ring.win.length} ${ring.circumference - ring.win.length}`"
          :stroke-dashoffset="-ring.win.offset"
        />
        <circle
          class="stroke-loss"
          cx="116"
          cy="116"
          r="106"
          fill="none"
          stroke-width="20"
          stroke-linecap="butt"
          :stroke-dasharray="`${ring.loss.length} ${ring.circumference - ring.loss.length}`"
          :stroke-dashoffset="-ring.loss.offset"
        />
      </g>

      <circle
        v-else
        aria-hidden="true"
        class="stroke-surface-muted"
        cx="116"
        cy="116"
        r="106"
        fill="none"
        stroke-width="20"
      />

      <line
        aria-hidden="true"
        class="stroke-ink"
        x1="116"
        y1="204"
        x2="116"
        y2="232"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>

    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2"
    >
      <template v-if="ring">
        <p class="flex items-baseline gap-1 text-win-text">
          <span>✓</span>
          <span class="font-display text-lg font-bold tabular-nums md:text-2xl">{{ wins }}</span>
          <span class="text-xs font-semibold text-ink-muted">V</span>
        </p>
        <span class="h-px w-14 bg-divider"></span>
        <p class="flex items-baseline gap-1 text-loss-text">
          <span>✕</span>
          <span class="font-display text-lg font-bold tabular-nums md:text-2xl">{{ losses }}</span>
          <span class="text-xs font-semibold text-ink-muted">D</span>
        </p>
      </template>
      <span
        v-else
        class="text-sm font-semibold text-ink-muted"
        >Sin datos</span
      >
    </div>
  </div>
</template>
