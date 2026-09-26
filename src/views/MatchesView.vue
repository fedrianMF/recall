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
        <h2 id="matches-title" class="text-2xl font-semibold tracking-tight">Historial</h2>
        <p class="mt-1 text-sm text-slate-400">{{ meta.total }} partidas encontradas.</p>
      </div>

      <label class="flex items-center gap-3 text-sm font-medium text-slate-300">
        <span>Cola</span>
        <select
          v-model="queue"
          class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        >
          <option value="">Todas</option>
          <option value="420">Solo/Dúo</option>
          <option value="440">Flex</option>
          <option value="450">ARAM</option>
          <option value="400">Normal</option>
        </select>
      </label>
    </div>

    <div v-if="isLoading" class="mt-6" role="status" aria-live="polite">
      <p class="text-slate-400">Cargando historial…</p>
      <div class="mt-4 space-y-3">
        <div
          v-for="index in 5"
          :key="index"
          class="h-32 animate-pulse rounded-xl border border-slate-800 bg-slate-900"
        ></div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="mt-6 rounded-xl border border-rose-900/70 bg-rose-950/40 p-6"
      role="alert"
    >
      <h3 class="font-semibold text-rose-200">No se pudo cargar el historial</h3>
      <p class="mt-2 text-sm text-rose-300">{{ error.message }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
        @click="loadMatches"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="matches.length === 0"
      class="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center"
    >
      <h3 class="font-semibold text-slate-200">No hay partidas para mostrar</h3>
      <p class="mt-2 text-sm text-slate-400">Prueba con otra cuenta o cola.</p>
    </div>

    <template v-else>
      <ul class="mt-6 overflow-hidden rounded-xl border border-slate-800">
        <MatchRow
          v-for="match in matches"
          :key="match.id"
          :match="match"
          :data-dragon-version="dataDragonVersion"
        />
      </ul>

      <nav aria-label="Paginación del historial" class="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          :disabled="page <= 1"
          class="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          @click="previousPage"
        >
          Anterior
        </button>

        <p class="text-sm text-slate-400">
          Página <span class="font-semibold text-slate-200">{{ meta.current_page }}</span> de
          <span class="font-semibold text-slate-200">{{ meta.last_page }}</span>
        </p>

        <button
          type="button"
          :disabled="page >= meta.last_page"
          class="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          @click="nextPage"
        >
          Siguiente
        </button>
      </nav>
    </template>
  </section>
</template>
