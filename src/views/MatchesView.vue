<script setup>
import { ref } from 'vue'
import MatchRow from '../components/MatchRow.vue'
import { useAccount } from '../composables/useAccount'
import { useDataDragonVersion } from '../composables/useDataDragonVersion'
import { useMatches } from '../composables/useMatches'

const { account } = useAccount()
const { version: dataDragonVersion } = useDataDragonVersion()
const queue = ref('')
const page = ref(1)
const { matches, meta, isLoading, error, loadMatches } = useMatches(account, queue, page)

function previousPage() {
  if (page.value > 1) {
    page.value -= 1
  }
}

function nextPage() {
  if (page.value < meta.value.last_page) {
    page.value += 1
  }
}
</script>

<template>
  <section aria-labelledby="matches-title">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1
          id="matches-title"
          class="text-2xl font-semibold tracking-tight"
        >
          Historial
        </h1>
        <p class="mt-1 text-sm text-fg-muted">{{ meta.total }} partidas encontradas.</p>
      </div>

      <label class="flex items-center gap-3 text-sm font-medium text-fg-soft">
        <span>Cola</span>
        <select
          v-model="queue"
          class="rounded-lg border border-line-strong bg-card px-3 py-2 text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
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
      <p class="text-fg-muted">Cargando historial…</p>
      <div class="mt-4 space-y-3">
        <div
          v-for="index in 5"
          :key="index"
          class="h-32 animate-pulse rounded-xl border border-line bg-card"
        ></div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="mt-6 rounded-xl border border-danger-border/70 bg-danger-soft/40 p-6"
      role="alert"
    >
      <h3 class="font-semibold text-danger-fg-strong">No se pudo cargar el historial</h3>
      <p class="mt-2 text-sm text-danger-fg">{{ error.message }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-danger-solid px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger-solid-hover focus:outline-none focus:ring-2 focus:ring-danger-fg"
        @click="loadMatches"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="matches.length === 0"
      class="mt-6 rounded-xl border border-line bg-card p-8 text-center"
    >
      <h3 class="font-semibold text-fg">No hay partidas para mostrar</h3>
      <p class="mt-2 text-sm text-fg-muted">Prueba con otra cuenta o cola.</p>
    </div>

    <template v-else>
      <ul class="mt-6 overflow-hidden rounded-xl border border-line">
        <MatchRow
          v-for="match in matches"
          :key="match.id"
          :match="match"
          :data-dragon-version="dataDragonVersion"
        />
      </ul>

      <nav
        aria-label="Paginación del historial"
        class="mt-6 flex items-center justify-between gap-4"
      >
        <button
          type="button"
          :disabled="page <= 1"
          class="rounded-lg border border-line-strong px-4 py-2 text-sm font-semibold text-fg transition hover:border-accent hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          @click="previousPage"
        >
          Anterior
        </button>

        <p class="text-sm text-fg-muted">
          Página <span class="font-semibold text-fg">{{ meta.current_page }}</span> de
          <span class="font-semibold text-fg">{{ meta.last_page }}</span>
        </p>

        <button
          type="button"
          :disabled="page >= meta.last_page"
          class="rounded-lg border border-line-strong px-4 py-2 text-sm font-semibold text-fg transition hover:border-accent hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          @click="nextPage"
        >
          Siguiente
        </button>
      </nav>
    </template>
  </section>
</template>
