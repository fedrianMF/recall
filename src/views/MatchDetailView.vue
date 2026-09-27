<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ChampionAvatar from '../components/ChampionAvatar.vue'
import MetricCard from '../components/MetricCard.vue'
import TeamTable from '../components/TeamTable.vue'
import { useDataDragonVersion } from '../composables/useDataDragonVersion'
import { useMatch } from '../composables/useMatch'
import { formatDuration, formatRelativeTime } from '../utils/formatMatch'

const route = useRoute()
const matchId = computed(() => String(route.params.id))
const { version: dataDragonVersion } = useDataDragonVersion()
const { match, isLoading, error, loadMatch } = useMatch(matchId)

const result = computed(() => {
  if (match.value?.remake) {
    return 'Remake'
  }

  return match.value?.win ? 'Victoria' : 'Derrota'
})
</script>

<template>
  <section aria-labelledby="match-title">
    <RouterLink
      to="/matches"
      class="text-sm font-medium text-cyan-400 hover:text-cyan-300"
    >
      ← Volver al historial
    </RouterLink>

    <div
      v-if="isLoading"
      class="mt-6"
      role="status"
      aria-live="polite"
    >
      <p class="text-slate-400">Cargando partida…</p>
      <div class="mt-4 h-80 animate-pulse rounded-xl border border-slate-800 bg-slate-900"></div>
    </div>

    <div
      v-else-if="error?.status === 404"
      class="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center"
    >
      <h2
        id="match-title"
        class="text-xl font-semibold text-slate-100"
      >
        Partida no encontrada
      </h2>
      <p class="mt-2 text-sm text-slate-400">
        La partida solicitada no existe o ya no está disponible.
      </p>
      <RouterLink
        to="/matches"
        class="mt-5 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
      >
        Volver al historial
      </RouterLink>
    </div>

    <div
      v-else-if="error"
      class="mt-6 rounded-xl border border-rose-900/70 bg-rose-950/40 p-6"
      role="alert"
    >
      <h2
        id="match-title"
        class="font-semibold text-rose-200"
      >
        No se pudo cargar la partida
      </h2>
      <p class="mt-2 text-sm text-rose-300">{{ error.message }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
        @click="loadMatch"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="match"
      class="mt-6 space-y-8"
    >
      <header
        class="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5"
      >
        <ChampionAvatar
          :champion="match.champion"
          :version="dataDragonVersion"
        />
        <div>
          <h2
            id="match-title"
            class="text-2xl font-semibold text-slate-100"
          >
            {{ match.champion }}
          </h2>
          <p class="text-sm text-slate-400">{{ match.queue.name }} · {{ match.position }}</p>
          <p class="mt-1 text-xs text-slate-500">
            {{ formatRelativeTime(match.started_at) }} ·
            {{ formatDuration(match.duration_seconds) }}
          </p>
        </div>
        <span
          class="ml-auto rounded-full px-3 py-1 text-sm font-semibold"
          :class="
            match.remake
              ? 'bg-slate-800 text-slate-300'
              : match.win
                ? 'bg-emerald-950 text-emerald-300'
                : 'bg-rose-950 text-rose-300'
          "
        >
          {{ result }}
        </span>
      </header>

      <section aria-labelledby="personal-metrics-title">
        <h3
          id="personal-metrics-title"
          class="text-lg font-semibold text-slate-100"
        >
          Tus métricas
        </h3>
        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <MetricCard
            label="K / D / A"
            :value="`${match.kills} / ${match.deaths} / ${match.assists}`"
          />
          <MetricCard
            label="KDA"
            :value="match.kda"
          />
          <MetricCard
            label="CS"
            :value="match.cs"
          />
          <MetricCard
            label="CS/min"
            :value="match.cs_per_min"
          />
          <MetricCard
            label="Daño"
            :value="match.damage_to_champions"
          />
          <MetricCard
            label="Visión"
            :value="match.vision_score"
          />
          <MetricCard
            label="Participación"
            :value="match.kill_participation"
            suffix="%"
          />
          <MetricCard
            label="CS al minuto 10"
            :value="match.cs_at_10"
          />
          <MetricCard
            label="Daño del equipo"
            :value="match.team_damage_percentage"
            suffix="%"
          />
          <MetricCard
            label="Ventaja temprana oro/XP"
            :value="match.early_gold_xp_advantage"
          />
          <MetricCard
            label="Asesinatos en solitario"
            :value="match.solo_kills"
          />
        </div>
      </section>

      <div class="space-y-8">
        <TeamTable
          v-for="team in match.teams"
          :key="team.team_id"
          :team="team"
          :data-dragon-version="dataDragonVersion"
        />
      </div>
    </div>
  </section>
</template>
