<script setup>
import { computed } from 'vue'
import { hasEnoughMeasurements } from '../../utils/rankChart'
import { formatQueueType } from '../../utils/summaryFormat'
import RankChart from './RankChart.vue'
import SummaryErrorPanel from './SummaryErrorPanel.vue'
import SummaryPanel from './SummaryPanel.vue'

const props = defineProps({
  // Entries of the rank history endpoint.
  history: {
    type: Array,
    default: () => [],
  },
  queueType: {
    type: String,
    default: '',
  },
  hasAccount: {
    type: Boolean,
    default: true,
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

// The chart needs at least 2 valid measurements: hasEnoughMeasurements checks it.
const hasEnoughData = computed(() => hasEnoughMeasurements(props.history))
</script>

<template>
  <SummaryPanel title="Evolución del rango">
    <p
      v-if="!hasAccount"
      class="text-sm text-ink-muted"
    >
      Elige LAN o LAS para ver la evolución de tu rango.
    </p>

    <template v-else>
      <p
        v-if="queueType"
        class="text-sm text-ink-muted"
      >
        Cola: {{ formatQueueType(queueType) }}
      </p>

      <SummaryErrorPanel
        v-if="error"
        title="No se pudo cargar la evolución del rango"
        :heading-level="3"
        :message="error.message"
        @retry="$emit('retry')"
      />

      <RankChart
        v-if="hasEnoughData"
        :history="history"
      />

      <div
        v-else-if="isLoading && !error"
        role="status"
      >
        <span class="sr-only">Cargando evolución del rango…</span>
        <div
          aria-hidden="true"
          class="h-48 animate-pulse motion-reduce:animate-none rounded-control bg-surface-muted"
        ></div>
      </div>

      <p
        v-else-if="!error"
        class="text-sm text-ink-muted"
      >
        Aún no hay suficientes mediciones para dibujar la evolución.
      </p>
    </template>
  </SummaryPanel>
</template>
