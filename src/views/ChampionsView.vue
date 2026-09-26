<script setup>
import { computed, ref } from 'vue'
import ChampionAvatar from '../components/ChampionAvatar.vue'
import { useAccount } from '../composables/useAccount'
import { useChampions } from '../composables/useChampions'
import { useDataDragonVersion } from '../composables/useDataDragonVersion'
import { formatMetric } from '../utils/formatMetric'

const columns = [
  { key: 'champion', label: 'Campeón' },
  { key: 'games', label: 'Partidas' },
  { key: 'winrate', label: 'Winrate' },
  { key: 'kda', label: 'KDA' },
  { key: 'cs_per_min', label: 'CS/min' },
  { key: 'damage_per_min', label: 'Daño/min' },
  { key: 'kill_participation', label: 'Participación' },
]

const { account } = useAccount()
const minGames = ref(1)
const sortKey = ref('games')
const sortDirection = ref('desc')
const { version: dataDragonVersion } = useDataDragonVersion()
const { champions, isLoading, error, loadChampions } = useChampions(account, minGames)

const sortedChampions = computed(() => {
  return [...champions.value].sort((firstChampion, secondChampion) => {
    const firstValue = firstChampion[sortKey.value]
    const secondValue = secondChampion[sortKey.value]

    if (
      (firstValue === null || firstValue === undefined) &&
      (secondValue === null || secondValue === undefined)
    ) {
      return 0
    }

    if (firstValue === null || firstValue === undefined) {
      return 1
    }

    if (secondValue === null || secondValue === undefined) {
      return -1
    }

    const comparison =
      typeof firstValue === 'string'
        ? firstValue.localeCompare(secondValue)
        : firstValue - secondValue

    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

function sortBy(column) {
  if (sortKey.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortKey.value = column
  sortDirection.value = column === 'champion' ? 'asc' : 'desc'
}

function ariaSort(column) {
  if (sortKey.value !== column) {
    return 'none'
  }

  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

</script>

<template>
  <section aria-labelledby="champions-title">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 id="champions-title" class="text-2xl font-semibold tracking-tight">Campeones</h2>
        <p class="mt-1 text-sm text-slate-400">Rendimiento agrupado por campeón.</p>
      </div>

      <label class="flex items-center gap-3 text-sm font-medium text-slate-300">
        <span>Mínimo de partidas</span>
        <select
          v-model.number="minGames"
          class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        >
          <option :value="1">1</option>
          <option :value="3">3</option>
          <option :value="5">5</option>
          <option :value="10">10</option>
        </select>
      </label>
    </div>

    <div v-if="isLoading" class="mt-6" role="status" aria-live="polite">
      <p class="text-slate-400">Cargando campeones…</p>
      <div class="mt-4 h-72 animate-pulse rounded-xl border border-slate-800 bg-slate-900"></div>
    </div>

    <div
      v-else-if="error"
      class="mt-6 rounded-xl border border-rose-900/70 bg-rose-950/40 p-6"
      role="alert"
    >
      <h3 class="font-semibold text-rose-200">No se pudieron cargar los campeones</h3>
      <p class="mt-2 text-sm text-rose-300">{{ error.message }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
        @click="loadChampions"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="champions.length === 0"
      class="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center"
    >
      <h3 class="font-semibold text-slate-200">No hay campeones para mostrar</h3>
      <p class="mt-2 text-sm text-slate-400">
        Prueba con otra cuenta o con un mínimo menor de partidas.
      </p>
    </div>

    <div v-else class="mt-6 overflow-x-auto rounded-xl border border-slate-800">
      <table class="w-full min-w-5xl border-collapse bg-slate-900 text-left text-sm">
        <thead class="bg-slate-900/95 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :aria-sort="ariaSort(column.key)"
              class="border-b border-slate-800 px-4 py-3 font-medium"
            >
              <button
                type="button"
                class="flex w-full items-center gap-2 whitespace-nowrap text-left transition hover:text-slate-100 focus:outline-none focus:text-cyan-400"
                @click="sortBy(column.key)"
              >
                {{ column.label }}
                <span v-if="sortKey === column.key" aria-hidden="true">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr v-for="champion in sortedChampions" :key="champion.champion" class="hover:bg-slate-800/40">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 font-medium text-slate-100">
                <ChampionAvatar :champion="champion.champion" :version="dataDragonVersion" />
                <span class="whitespace-nowrap">{{ champion.champion }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-300">{{ formatMetric(champion.games) }}</td>
            <td class="px-4 py-3 text-slate-300">{{ formatMetric(champion.winrate, '%') }}</td>
            <td class="px-4 py-3 text-slate-300">{{ formatMetric(champion.kda) }}</td>
            <td class="px-4 py-3 text-slate-300">{{ formatMetric(champion.cs_per_min) }}</td>
            <td class="px-4 py-3 text-slate-300">{{ formatMetric(champion.damage_per_min) }}</td>
            <td class="px-4 py-3 text-slate-300">
              {{ formatMetric(champion.kill_participation, '%') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
