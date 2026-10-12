<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ChampionAvatar from '../components/ChampionAvatar.vue'
import MetricCard from '../components/MetricCard.vue'
import TeamTable from '../components/TeamTable.vue'
import { useDataDragonVersion } from '../composables/useDataDragonVersion'
import { useMatch } from '../composables/useMatch'
import { formatDuration, formatRelativeTime } from '../utils/formatMatch'

const route = useRoute()
const matchId = computed(() => String(route.params.id))
const viewElement = ref(null)
const { version: dataDragonVersion } = useDataDragonVersion()
const { match, isLoading, error, loadMatch } = useMatch(matchId)

const result = computed(() => {
  if (match.value?.remake) {
    return 'Remake'
  }

  return match.value?.win ? 'Victoria' : 'Derrota'
})

function retry() {
  // Focus before the error panel unmounts so the browser does not return focus to <body>.
  viewElement.value?.focus()
  loadMatch()
}
</script>

<template>
  <section
    ref="viewElement"
    tabindex="-1"
    :aria-labelledby="isLoading ? undefined : 'match-title'"
  >
    <RouterLink
      to="/matches"
      class="inline-flex min-h-11 items-center text-sm font-medium text-sky-text hover:underline"
    >
      ← Volver al historial
    </RouterLink>

    <div
      v-if="isLoading"
      class="mt-6"
      role="status"
      aria-live="polite"
    >
      <p class="sr-only">Cargando partida…</p>
      <div
        aria-hidden="true"
        class="h-80 animate-pulse motion-reduce:animate-none rounded-2xl bg-surface-muted"
      ></div>
    </div>

    <div
      v-else-if="error?.status === 404"
      class="mt-6 rounded-2xl bg-surface p-8 text-center shadow-card"
    >
      <h1
        id="match-title"
        class="font-display text-2xl font-bold text-ink"
      >
        Partida no encontrada
      </h1>
      <p class="mt-2 text-sm text-ink-muted">
        La partida solicitada no existe o ya no está disponible.
      </p>
      <RouterLink
        to="/matches"
        class="mt-5 inline-flex min-h-11 items-center rounded-control bg-rail px-5 text-sm font-semibold text-on-dark transition-colors hover:bg-charcoal-hover"
      >
        Volver al historial
      </RouterLink>
    </div>

    <div
      v-else-if="error"
      class="mt-6 rounded-2xl border border-danger-border bg-danger-soft p-6"
      role="alert"
    >
      <h1
        id="match-title"
        class="font-display text-2xl font-bold text-danger-fg-strong"
      >
        No se pudo cargar la partida
      </h1>
      <p class="mt-2 text-sm text-danger-fg">{{ error.message }}</p>
      <button
        type="button"
        class="mt-4 min-h-11 rounded-control bg-danger-solid px-5 text-sm font-semibold text-on-dark transition-colors hover:bg-danger-solid-hover"
        @click="retry"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="match"
      class="mt-6 space-y-8"
    >
      <header class="flex flex-wrap items-center gap-4 rounded-2xl bg-surface p-5 shadow-card">
        <ChampionAvatar
          :champion="match.champion"
          :version="dataDragonVersion"
        />
        <div>
          <h1
            id="match-title"
            class="font-display text-2xl font-bold text-ink md:text-3xl"
          >
            {{ match.champion }}
          </h1>
          <p class="text-sm text-ink-muted">{{ match.queue.name }} · {{ match.position }}</p>
          <p class="mt-1 text-xs text-ink-muted">
            {{ formatRelativeTime(match.started_at) }} ·
            {{ formatDuration(match.duration_seconds) }}
          </p>
        </div>
        <span
          class="ml-auto rounded-full px-3 py-1 text-sm font-semibold"
          :class="
            match.remake
              ? 'bg-surface-muted text-ink-muted'
              : match.win
                ? 'bg-win-soft text-win-text'
                : 'bg-loss-soft text-loss-text'
          "
        >
          {{ result }}
        </span>
      </header>

      <section aria-labelledby="personal-metrics-title">
        <h2
          id="personal-metrics-title"
          class="font-display text-xl font-bold text-ink"
        >
          Tus métricas
        </h2>
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
