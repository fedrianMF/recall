<script setup>
import { ref } from 'vue'
import MatchRow from '../components/MatchRow.vue'
import SummaryEmptyPanel from '../components/summary/SummaryEmptyPanel.vue'
import SummaryErrorPanel from '../components/summary/SummaryErrorPanel.vue'
import { useAccount } from '../composables/useAccount'
import { useDataDragonVersion } from '../composables/useDataDragonVersion'
import { useMatches } from '../composables/useMatches'

const { account } = useAccount()
const { version: dataDragonVersion } = useDataDragonVersion()
const queue = ref('')
const page = ref(1)
const titleElement = ref(null)
const { matches, meta, isLoading, error, loadMatches } = useMatches(account, queue, page)

function previousPage() {
  if (page.value > 1) {
    page.value -= 1
    // Focus before the current content unmounts so the browser does not return focus to <body>.
    titleElement.value?.focus()
  }
}

function nextPage() {
  if (page.value < meta.value.last_page) {
    page.value += 1
    // Focus before the current content unmounts so the browser does not return focus to <body>.
    titleElement.value?.focus()
  }
}

function retry() {
  // Focus before the error panel unmounts so the browser does not return focus to <body>.
  titleElement.value?.focus()
  loadMatches()
}
</script>

<template>
  <section aria-labelledby="matches-title">
    <div class="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <h1
          ref="titleElement"
          id="matches-title"
          tabindex="-1"
          class="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl"
        >
          Historial
        </h1>
        <p class="mt-1 text-sm text-ink-muted">{{ meta.total }} partidas encontradas.</p>
      </div>

      <label class="flex items-center justify-between gap-3 text-sm font-medium text-ink-muted">
        <span>Cola</span>
        <select
          v-model="queue"
          class="min-h-11 rounded-control border border-divider bg-surface px-3 text-ink"
        >
          <option value="">Todas</option>
          <option value="420">Solo/Dúo</option>
          <option value="440">Flex</option>
          <option value="450">ARAM</option>
          <option value="400">Normal</option>
        </select>
      </label>
    </div>

    <div
      v-if="isLoading"
      class="mt-6"
      role="status"
      aria-live="polite"
    >
      <p class="sr-only">Cargando historial…</p>
      <div
        aria-hidden="true"
        class="space-y-3"
      >
        <div
          v-for="index in 5"
          :key="index"
          class="h-32 animate-pulse motion-reduce:animate-none rounded-2xl bg-surface-muted"
        ></div>
      </div>
    </div>

    <SummaryErrorPanel
      v-else-if="error"
      class="mt-6"
      title="No se pudo cargar el historial"
      :message="error.message"
      @retry="retry"
    />

    <SummaryEmptyPanel
      v-else-if="matches.length === 0"
      class="mt-6"
      title="No hay partidas para mostrar"
      description="Prueba con otra cuenta o cola."
    />

    <template v-else>
      <ul class="mt-6 divide-y divide-divider overflow-hidden rounded-2xl bg-surface shadow-card">
        <MatchRow
          v-for="match in matches"
          :key="match.id"
          :match="match"
          :data-dragon-version="dataDragonVersion"
        />
      </ul>

      <nav
        aria-label="Paginación del historial"
        class="mt-6 grid grid-cols-2 items-center gap-3 sm:grid-cols-[auto_1fr_auto] sm:gap-4"
      >
        <button
          type="button"
          :disabled="page <= 1"
          class="row-start-2 min-h-11 rounded-control border border-divider bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50 sm:row-start-1"
          @click="previousPage"
        >
          Anterior
        </button>

        <p
          class="col-span-2 row-start-1 text-center text-sm text-ink-muted sm:col-span-1 sm:col-start-2"
        >
          Página <span class="font-semibold text-ink">{{ meta.current_page }}</span> de
          <span class="font-semibold text-ink">{{ meta.last_page }}</span>
        </p>

        <button
          type="button"
          :disabled="page >= meta.last_page"
          class="row-start-2 min-h-11 rounded-control border border-divider bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50 sm:row-start-1 sm:col-start-3"
          @click="nextPage"
        >
          Siguiente
        </button>
      </nav>
    </template>
  </section>
</template>
