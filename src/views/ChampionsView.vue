<script setup>
import { computed, ref } from 'vue'
import ChampionAvatar from '../components/ChampionAvatar.vue'
import SummaryEmptyPanel from '../components/summary/SummaryEmptyPanel.vue'
import SummaryErrorPanel from '../components/summary/SummaryErrorPanel.vue'
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
    <div class="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <h1
          id="champions-title"
          class="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl"
        >
          Campeones
        </h1>
        <p class="mt-1 text-sm text-ink-muted">Rendimiento agrupado por campeón.</p>
      </div>

      <label class="flex items-center gap-3 text-sm font-medium text-ink-muted">
        <span>Mínimo de partidas</span>
        <select
          v-model.number="minGames"
          class="min-h-11 rounded-control border border-divider bg-surface px-3 text-ink"
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
      <p class="sr-only">Cargando campeones…</p>
      <div
        aria-hidden="true"
        class="h-72 animate-pulse motion-reduce:animate-none rounded-2xl bg-surface-muted"
      ></div>
    </div>

    <SummaryErrorPanel
      v-else-if="error"
      class="mt-6"
      title="No se pudieron cargar los campeones"
      :message="error.message"
      @retry="loadChampions"
    />

    <SummaryEmptyPanel
      v-else-if="champions.length === 0"
      class="mt-6"
      title="No hay campeones para mostrar"
      description="Prueba con otra cuenta o con un mínimo menor de partidas."
    />

    <div
      v-else
      class="mt-6 max-w-full overflow-x-auto rounded-2xl bg-surface shadow-card"
    >
      <table class="w-full min-w-5xl border-collapse bg-surface text-left text-sm text-ink">
        <thead class="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :aria-sort="ariaSort(column.key)"
              class="border-b border-divider px-4 font-medium"
            >
              <button
                type="button"
                class="flex min-h-11 w-full items-center gap-2 whitespace-nowrap text-left transition-colors hover:text-ink"
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
        <tbody class="divide-y divide-divider">
          <tr
            v-for="champion in sortedChampions"
            :key="champion.champion"
            class="hover:bg-surface-muted"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 font-medium text-ink">
                <ChampionAvatar
                  :champion="champion.champion"
                  :version="dataDragonVersion"
                />
                <span class="whitespace-nowrap">{{ champion.champion }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-ink">{{ formatMetric(champion.games) }}</td>
            <td class="px-4 py-3 text-ink">
              {{ formatMetric(champion.winrate, '%') }}
            </td>
            <td class="px-4 py-3 text-ink">{{ formatMetric(champion.kda) }}</td>
            <td class="px-4 py-3 text-ink">{{ formatMetric(champion.cs_per_min) }}</td>
            <td class="px-4 py-3 text-ink">
              {{ formatMetric(champion.damage_per_min) }}
            </td>
            <td class="px-4 py-3 text-ink">
              {{ formatMetric(champion.kill_participation, '%') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
