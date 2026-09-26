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
      <h3 class="text-lg font-semibold text-slate-100">
        {{ teamName }}
        <span class="ml-2 text-sm font-normal text-slate-400">
          {{ formatMetric(team.kills) }} asesinatos
        </span>
      </h3>
      <span
        class="rounded-full px-3 py-1 text-xs font-semibold"
        :class="team.win ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'"
      >
        {{ team.win ? 'Victoria' : 'Derrota' }}
      </span>
    </div>

    <div class="mt-3 overflow-x-auto rounded-xl border border-slate-800">
      <table class="w-full min-w-3xl border-collapse bg-slate-900 text-left text-sm">
        <thead class="text-xs uppercase tracking-wide text-slate-400">
          <tr class="border-b border-slate-800">
            <th scope="col" class="px-4 py-3 font-medium">Jugador</th>
            <th scope="col" class="px-4 py-3 font-medium">Posición</th>
            <th scope="col" class="px-4 py-3 font-medium">K / D / A</th>
            <th scope="col" class="px-4 py-3 font-medium">CS</th>
            <th scope="col" class="px-4 py-3 font-medium">Daño</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr
            v-for="player in team.players"
            :key="player.riot_id"
            :class="player.is_me ? 'bg-cyan-950/40' : 'hover:bg-slate-800/40'"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <ChampionAvatar :champion="player.champion" :version="dataDragonVersion" />
                <div>
                  <p class="font-medium text-slate-100">{{ player.riot_id }}</p>
                  <p class="text-xs text-slate-400">{{ player.champion }}</p>
                </div>
                <span
                  v-if="player.is_me"
                  class="rounded-full bg-cyan-900 px-2 py-0.5 text-xs font-semibold text-cyan-200"
                >
                  Tú
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-300">{{ player.position }}</td>
            <td class="px-4 py-3 text-slate-300">
              {{ player.kills }} / {{ player.deaths }} / {{ player.assists }}
            </td>
            <td class="px-4 py-3 text-slate-300">{{ formatMetric(player.cs) }}</td>
            <td class="px-4 py-3 text-slate-300">{{ formatMetric(player.damage) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
