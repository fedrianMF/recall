<script setup>
import { computed } from 'vue'
import ChampionAvatar from './ChampionAvatar.vue'
import { formatMetric } from '../utils/formatMetric'

const props = defineProps({
  team: {
    type: Object,
    required: true,
  },
  dataDragonVersion: {
    type: String,
    default: null,
  },
})

const teamName = computed(() => (props.team.team_id === 100 ? 'Equipo azul' : 'Equipo rojo'))
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="font-display text-lg font-bold text-ink">
        {{ teamName }}
        <span class="ml-2 text-sm font-normal text-ink-muted">
          {{ formatMetric(team.kills) }} asesinatos
        </span>
      </h2>
      <span
        class="rounded-full px-3 py-1 text-xs font-semibold"
        :class="team.win ? 'bg-win-soft text-win-text' : 'bg-loss-soft text-loss-text'"
      >
        {{ team.win ? 'Victoria' : 'Derrota' }}
      </span>
    </div>

    <div class="mt-3 overflow-x-auto rounded-2xl bg-surface shadow-card">
      <table class="w-full min-w-3xl border-collapse bg-surface text-left text-sm text-ink">
        <thead class="text-xs uppercase tracking-wide text-ink-muted">
          <tr class="border-b border-divider">
            <th
              scope="col"
              class="px-4 py-3 font-medium"
            >
              Jugador
            </th>
            <th
              scope="col"
              class="px-4 py-3 font-medium"
            >
              Posición
            </th>
            <th
              scope="col"
              class="px-4 py-3 font-medium"
            >
              K / D / A
            </th>
            <th
              scope="col"
              class="px-4 py-3 font-medium"
            >
              CS
            </th>
            <th
              scope="col"
              class="px-4 py-3 font-medium"
            >
              Daño
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-divider">
          <tr
            v-for="player in team.players"
            :key="player.riot_id"
            :class="player.is_me ? 'bg-sky-soft' : 'hover:bg-surface-muted'"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <ChampionAvatar
                  :champion="player.champion"
                  :version="dataDragonVersion"
                />
                <div>
                  <p class="font-medium text-ink">{{ player.riot_id }}</p>
                  <p class="text-xs text-ink-muted">{{ player.champion }}</p>
                </div>
                <span
                  v-if="player.is_me"
                  class="rounded-full bg-rail px-2 py-0.5 text-xs font-semibold text-on-dark"
                >
                  Tú
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-ink">{{ player.position }}</td>
            <td class="px-4 py-3 text-ink">
              {{ player.kills }} / {{ player.deaths }} / {{ player.assists }}
            </td>
            <td class="px-4 py-3 text-ink">{{ formatMetric(player.cs) }}</td>
            <td class="px-4 py-3 text-ink">{{ formatMetric(player.damage) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
