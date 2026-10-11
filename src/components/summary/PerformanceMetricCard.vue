<script setup>
import { computed } from 'vue'
import { getProgressPercent } from '../../utils/summaryFormat'
import MetricIcon from './MetricIcon.vue'
import ProgressBar from './ProgressBar.vue'

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
    <dl class="h-full">
      <!-- One div groups the dt with its dd elements, which is valid inside a dl -->
      <div class="flex h-full flex-col">
        <dt class="mb-4 flex min-w-0 items-center gap-2.5 text-sm font-semibold">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-lg"
            :class="chipClasses"
          >
            <MetricIcon
              :name="icon"
              class="size-[18px]"
            />
          </span>
          <span class="min-w-0 break-words">{{ label }}</span>
        </dt>

        <!-- mt-auto pushes the value (and what follows) to the bottom of the card -->
        <dd
          class="mt-auto font-display text-[32px] leading-none font-bold tracking-tight tabular-nums md:text-[40px]"
        >
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
          <ProgressBar
            :percent="getProgressPercent(progress, 100)"
            :label="progressLabel"
            size="sm"
          />
        </dd>
      </div>
    </dl>
  </article>
</template>
