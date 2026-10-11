<script setup>
import { computed } from 'vue'
import { getProgressPercent } from '../../utils/summaryFormat'
import MetricIcon from './MetricIcon.vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  // Already formatted by the parent (for example "2.8" or "48.5%").
  value: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'kda',
  },
  // 0-100. When it is a number, a sky progress bar is drawn.
  progress: {
    type: Number,
    default: null,
  },
})

// The mockup uses a sky chip for vision and participation, and a neutral chip for the rest.
const SKY_ICONS = ['vision', 'participation']

const hasProgress = computed(() => props.progress !== null)
const chipClasses = computed(() =>
  SKY_ICONS.includes(props.icon) ? 'bg-sky-soft text-sky-text' : 'bg-surface-muted text-ink',
)
const progressLabel = computed(() => `${props.label} ${props.value}`)
</script>

<template>
  <article class="rounded-metric bg-surface p-5 text-ink shadow-card md:min-h-39">
    <dl class="flex h-full flex-col justify-between gap-4">
      <dt class="flex items-center gap-2.5 text-sm font-semibold">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-lg"
          :class="chipClasses"
        >
          <MetricIcon
            :name="icon"
            class="size-[18px]"
          />
        </span>
        {{ label }}
      </dt>

      <div>
        <dd class="font-display text-[40px] leading-none font-bold tracking-tight tabular-nums">
          {{ value }}
        </dd>
        <dd
          v-if="caption"
          class="mt-1.5 text-[13px] text-ink-muted"
        >
          {{ caption }}
        </dd>
        <dd
          v-if="hasProgress"
          class="mt-3"
        >
          <div
            class="h-1.5 rounded-full bg-sky-soft"
            role="img"
            :aria-label="progressLabel"
          >
            <div
              class="h-1.5 rounded-full bg-sky"
              :style="{ width: `${getProgressPercent(progress, 100)}%` }"
            ></div>
          </div>
        </dd>
      </div>
    </dl>
  </article>
</template>
