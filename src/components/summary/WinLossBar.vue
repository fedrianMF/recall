<script setup>
import { computed } from 'vue'
import { getProgressPercent } from '../../utils/summaryFormat'

const props = defineProps({
  wins: {
    type: Number,
    default: null,
  },
  total: {
    type: Number,
    default: null,
  },
  // Text read by assistive technology: the bar itself is only visual.
  label: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value),
  },
})

const hasTotal = computed(() => Number.isFinite(props.total) && props.total > 0)
const heightClass = computed(() => (props.size === 'sm' ? 'h-2' : 'h-3'))
</script>

<template>
  <div
    class="flex gap-0.5 overflow-hidden rounded-full"
    :class="heightClass"
    role="img"
    :aria-label="label"
  >
    <template v-if="hasTotal">
      <span
        aria-hidden="true"
        class="bg-win"
        :style="{ width: `${getProgressPercent(wins, total)}%` }"
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
</template>
