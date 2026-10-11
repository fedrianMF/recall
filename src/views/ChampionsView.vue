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
        <h1
          id="champions-title"
          class="text-2xl font-semibold tracking-tight"
        >
          Campeones
        </h1>
        <p class="mt-1 text-sm text-fg-muted">Rendimiento agrupado por campeón.</p>
      </div>

      <label class="flex items-center gap-3 text-sm font-medium text-fg-soft">
        <span>Mínimo de partidas</span>
        <select
          v-model.number="minGames"
          class="rounded-lg border border-line-strong bg-card px-3 py-2 text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option :value="1">1</option>
          <option :value="3">3</option>
          <option :value="5">5</option>
          <option :value="10">10</option>
        </select>
      </label>
    </div>

    <div
      v-if="isLoading"
      class="mt-6"
      role="status"
      aria-live="polite"
    >
      <p class="text-fg-muted">Cargando campeones…</p>
      <div class="mt-4 h-72 animate-pulse rounded-xl border border-line bg-card"></div>
    </div>

    <div
      v-else-if="error"
      class="mt-6 rounded-xl border border-danger-border/70 bg-danger-soft/40 p-6"
      role="alert"
    >
      <h3 class="font-semibold text-danger-fg-strong">No se pudieron cargar los campeones</h3>
      <p class="mt-2 text-sm text-danger-fg">{{ error.message }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-danger-solid px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger-solid-hover focus:outline-none focus:ring-2 focus:ring-danger-fg"
        @click="loadChampions"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="champions.length === 0"
      class="mt-6 rounded-xl border border-line bg-card p-8 text-center"
    >
      <h3 class="font-semibold text-fg">No hay campeones para mostrar</h3>
      <p class="mt-2 text-sm text-fg-muted">
        Prueba con otra cuenta o con un mínimo menor de partidas.
      </p>
    </div>

    <div
      v-else
      class="mt-6 overflow-x-auto rounded-xl border border-line"
    >
      <table class="w-full min-w-5xl border-collapse bg-card text-left text-sm">
        <thead class="bg-card/95 text-xs uppercase tracking-wide text-fg-muted">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :aria-sort="ariaSort(column.key)"
              class="border-b border-line px-4 py-3 font-medium"
            >
              <button
                type="button"
                class="flex w-full items-center gap-2 whitespace-nowrap text-left transition hover:text-fg focus:outline-none focus:text-accent"
                @click="sortBy(column.key)"
              >
                {{ column.label }}
                <span
                  v-if="sortKey === column.key"
                  aria-hidden="true"
                >
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr
            v-for="champion in sortedChampions"
            :key="champion.champion"
            class="hover:bg-card-raised/40"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 font-medium text-fg">
                <ChampionAvatar
                  :champion="champion.champion"
                  :version="dataDragonVersion"
                />
                <span class="whitespace-nowrap">{{ champion.champion }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-fg-soft">{{ formatMetric(champion.games) }}</td>
            <td class="px-4 py-3 text-fg-soft">{{ formatMetric(champion.winrate, '%') }}</td>
            <td class="px-4 py-3 text-fg-soft">{{ formatMetric(champion.kda) }}</td>
            <td class="px-4 py-3 text-fg-soft">{{ formatMetric(champion.cs_per_min) }}</td>
            <td class="px-4 py-3 text-fg-soft">{{ formatMetric(champion.damage_per_min) }}</td>
            <td class="px-4 py-3 text-fg-soft">
              {{ formatMetric(champion.kill_participation, '%') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
