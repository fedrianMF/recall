<script setup>
import MatchRecord from '../components/MatchRecord.vue'
import MetricCard from '../components/MetricCard.vue'
import RankCard from '../components/RankCard.vue'
import { useAccount } from '../composables/useAccount'
import { useSummary } from '../composables/useSummary'

const { account } = useAccount()
const { summary, isLoading, error, loadSummary } = useSummary(account)
</script>

<template>
  <section aria-labelledby="summary-title">
    <h2
      id="summary-title"
      class="text-2xl font-semibold tracking-tight"
    >
      Resumen
    </h2>

    <div
      v-if="isLoading"
      class="mt-6"
      role="status"
      aria-live="polite"
    >
      <p class="text-fg-muted">Cargando resumen…</p>
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="index in 6"
          :key="index"
          class="h-28 animate-pulse rounded-xl border border-line bg-card"
        ></div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="mt-6 rounded-xl border border-danger-border/70 bg-danger-soft/40 p-6"
      role="alert"
    >
      <h3 class="font-semibold text-danger-fg-strong">No se pudo cargar el resumen</h3>
      <p class="mt-2 text-sm text-danger-fg">{{ error.message }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-danger-solid px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger-solid-hover focus:outline-none focus:ring-2 focus:ring-danger-fg"
        @click="loadSummary"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="summary?.games === 0"
      class="mt-6 rounded-xl border border-line bg-card p-8 text-center"
    >
      <h3 class="font-semibold text-fg">Todavía no hay partidas</h3>
      <p class="mt-2 text-sm text-fg-muted">
        No encontramos partidas para la cuenta seleccionada.
      </p>
    </div>

    <div
      v-else-if="summary"
      class="mt-6 space-y-8"
    >
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Winrate"
          :value="summary.winrate"
          suffix="%"
        />
        <MetricCard
          label="KDA"
          :value="summary.kda"
        />
        <MetricCard
          label="CS/min"
          :value="summary.cs_per_min"
        />
        <MetricCard
          label="Daño/min"
          :value="summary.damage_per_min"
        />
        <MetricCard
          label="Visión/min"
          :value="summary.vision_per_min"
        />
        <MetricCard
          label="Participación en asesinatos"
          :value="summary.kill_participation"
          suffix="%"
        />
      </div>

      <MatchRecord
        :games="summary.games"
        :wins="summary.wins"
        :losses="summary.losses"
      />

      <section aria-labelledby="ranks-title">
        <h3
          id="ranks-title"
          class="text-lg font-semibold text-fg"
        >
          Rangos
        </h3>

        <div
          v-if="summary.ranks?.length"
          class="mt-4 space-y-4"
        >
          <RankCard
            v-for="rank in summary.ranks"
            :key="`${rank.platform}-${rank.queue_type}`"
            :rank="rank"
          />
        </div>

        <p
          v-else
          class="mt-4 rounded-xl border border-line bg-card p-5 text-fg-muted"
        >
          Sin clasificar
        </p>
      </section>
    </div>
  </section>
</template>
