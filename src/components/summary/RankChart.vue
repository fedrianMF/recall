<script setup>
import { computed, ref, useId } from 'vue'
import { formatShortDate } from '../../utils/formatMatch'
import { describeMeasurement, getRankChart, getRankHistoryLabel } from '../../utils/rankChart'
import { formatTier } from '../../utils/summaryFormat'

const WIDTH = 400
const HEIGHT = 200
const PADDING = { top: 12, right: 12, bottom: 12, left: 12 }
// The tooltip hugs a side when the point is within this share of that edge.
const EDGE_RATIO = 0.25
const TOOLTIP_TRANSFORMS = {
  start: 'translate(0, -120%)',
  end: 'translate(-100%, -120%)',
  center: 'translate(-50%, -120%)',
}

const props = defineProps({
  history: {
    type: Array,
    default: () => [],
  },
})

const captionId = useId()
// Index of the point under the pointer, or null when there is none.
const activeIndex = ref(null)

const chart = computed(() =>
  getRankChart(props.history, { width: WIDTH, height: HEIGHT, padding: PADDING }),
)
const caption = computed(() => getRankHistoryLabel(props.history))
const firstPoint = computed(() => chart.value.points[0])
const lastPoint = computed(() => chart.value.points[chart.value.points.length - 1])
const plotRight = WIDTH - PADDING.right
const activePoint = computed(() =>
  activeIndex.value === null ? null : chart.value.points[activeIndex.value],
)

// Converts an SVG coordinate into a percentage of the plot container.
function toPercentX(x) {
  return (x / WIDTH) * 100
}
function toPercentY(y) {
  return (y / HEIGHT) * 100
}

const tooltipAlign = computed(() => {
  const ratio = activePoint.value.x / WIDTH
  if (ratio < EDGE_RATIO) {
    return 'start'
  }
  return ratio > 1 - EDGE_RATIO ? 'end' : 'center'
})
</script>

<template>
  <figure
    v-if="chart"
    class="relative"
  >
    <figcaption
      :id="captionId"
      class="mb-3 text-sm text-ink-muted"
    >
      {{ caption }}
    </figcaption>

    <div class="flex items-stretch gap-2">
      <div
        data-axis-y
        aria-hidden="true"
        class="relative w-20 shrink-0"
      >
        <span
          v-for="tick in chart.ticks"
          :key="tick.points"
          class="absolute right-0 -translate-y-1/2 text-xs text-ink-muted whitespace-nowrap"
          :style="{ top: `${toPercentY(tick.y)}%` }"
        >
          {{ tick.label }}
        </span>
      </div>

      <div
        data-plot
        class="relative min-w-0 flex-1"
      >
        <svg
          :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
          role="img"
          :aria-labelledby="captionId"
          class="block h-auto w-full"
        >
          <line
            v-for="tick in chart.ticks"
            :key="tick.points"
            :x1="PADDING.left"
            :x2="plotRight"
            :y1="tick.y"
            :y2="tick.y"
            class="stroke-divider"
            stroke-width="1"
          />

          <path
            :d="chart.path"
            fill="none"
            class="stroke-sky"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />

          <circle
            :cx="firstPoint.x"
            :cy="firstPoint.y"
            r="4"
            class="fill-sky stroke-surface"
            stroke-width="2"
          />
          <circle
            :cx="lastPoint.x"
            :cy="lastPoint.y"
            r="4"
            class="fill-sky stroke-surface"
            stroke-width="2"
          />

          <!-- Transparent, larger circles: an easy target for the pointer -->
          <circle
            v-for="(point, index) in chart.points"
            :key="index"
            data-point
            :cx="point.x"
            :cy="point.y"
            r="12"
            fill="transparent"
            class="cursor-pointer"
            @mouseenter="activeIndex = index"
            @mouseleave="activeIndex = null"
          />
        </svg>

        <!-- HTML text, so it keeps its real size when the chart shrinks -->
        <span
          data-end-label
          class="pointer-events-none absolute -translate-x-full -translate-y-full whitespace-nowrap text-xs font-semibold text-ink"
          :style="{
            left: `calc(${toPercentX(lastPoint.x)}% - 8px)`,
            top: `calc(${toPercentY(lastPoint.y)}% - 8px)`,
          }"
        >
          {{ describeMeasurement(lastPoint.measurement) }}
        </span>

        <div
          v-if="activePoint"
          role="tooltip"
          :data-align="tooltipAlign"
          class="pointer-events-none absolute rounded-control bg-rail px-3 py-2 text-xs text-on-dark shadow-float"
          :style="{
            left: `${toPercentX(activePoint.x)}%`,
            top: `${toPercentY(activePoint.y)}%`,
            transform: TOOLTIP_TRANSFORMS[tooltipAlign],
          }"
        >
          <p class="font-semibold">{{ formatShortDate(activePoint.measurement.taken_at) }}</p>
          <p>{{ describeMeasurement(activePoint.measurement) }}</p>
        </div>
      </div>
    </div>

    <!-- 88px = w-20 of the Y column (80px) + gap-2 (8px): aligns the dates with the plot -->
    <div
      data-axis-x
      aria-hidden="true"
      class="mt-1 flex justify-between pl-[88px] text-xs text-ink-muted"
    >
      <span>{{ formatShortDate(firstPoint.measurement.taken_at) }}</span>
      <span>{{ formatShortDate(lastPoint.measurement.taken_at) }}</span>
    </div>

    <details class="mt-3">
      <summary
        class="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-sky-text"
      >
        Ver datos en tabla
      </summary>
      <div
        class="overflow-x-auto"
        role="region"
        aria-label="Tabla de mediciones del rango"
        tabindex="0"
      >
        <table class="w-full text-left text-sm">
          <caption class="sr-only">
            Mediciones del rango
          </caption>
          <thead>
            <tr class="border-b border-divider">
              <th
                scope="col"
                class="py-2 pr-3 font-medium text-ink-muted"
              >
                Fecha
              </th>
              <th
                scope="col"
                class="py-2 pr-3 font-medium text-ink-muted"
              >
                Rango
              </th>
              <th
                scope="col"
                class="py-2 pr-3 font-medium text-ink-muted"
              >
                LP
              </th>
              <th
                scope="col"
                class="py-2 pr-3 font-medium text-ink-muted"
              >
                Victorias
              </th>
              <th
                scope="col"
                class="py-2 font-medium text-ink-muted"
              >
                Derrotas
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(point, index) in chart.points"
              :key="index"
              class="border-b border-divider"
            >
              <th
                scope="row"
                class="py-2 pr-3 text-left font-normal text-ink"
              >
                {{ formatShortDate(point.measurement.taken_at) }}
              </th>
              <td class="py-2 pr-3">
                {{ formatTier(point.measurement.tier, point.measurement.rank) }}
              </td>
              <td class="py-2 pr-3 tabular-nums">{{ point.measurement.league_points }}</td>
              <td class="py-2 pr-3 tabular-nums">{{ point.measurement.wins }}</td>
              <td class="py-2 tabular-nums">{{ point.measurement.losses }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </figure>
</template>
