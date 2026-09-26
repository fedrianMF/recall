<script setup>
import { toRef } from 'vue'
import MatchRecord from '../components/MatchRecord.vue'
import MetricCard from '../components/MetricCard.vue'
import RankCard from '../components/RankCard.vue'
import { useSummary } from '../composables/useSummary'

const props = defineProps({
  account: {
    type: String,
    default: '',
  },
})

const account = toRef(props, 'account')
const { summary, isLoading, error, loadSummary } = useSummary(account)
</script>

<template>
  <section aria-labelledby="summary-title">
    <h2 id="summary-title" class="text-2xl font-semibold tracking-tight">Resumen</h2>

    <div v-if="isLoading" class="mt-6" role="status" aria-live="polite">
      <p class="text-slate-400">Cargando resumen…</p>
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="index in 6"
          :key="index"
          class="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900"
        ></div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="mt-6 rounded-xl border border-rose-900/70 bg-rose-950/40 p-6"
      role="alert"
    >
      <h3 class="font-semibold text-rose-200">No se pudo cargar el resumen</h3>
      <p class="mt-2 text-sm text-rose-300">{{ error.message }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
        @click="loadSummary"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="summary?.games === 0"
      class="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center"
    >
      <h3 class="font-semibold text-slate-200">Todavía no hay partidas</h3>
      <p class="mt-2 text-sm text-slate-400">
        No encontramos partidas para la cuenta seleccionada.
      </p>
    </div>

    <div v-else-if="summary" class="mt-6 space-y-8">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Winrate" :value="summary.winrate" suffix="%" />
        <MetricCard label="KDA" :value="summary.kda" />
        <MetricCard label="CS/min" :value="summary.cs_per_min" />
        <MetricCard label="Daño/min" :value="summary.damage_per_min" />
        <MetricCard label="Visión/min" :value="summary.vision_per_min" />
        <MetricCard
          label="Participación en asesinatos"
          :value="summary.kill_participation"
          suffix="%"
        />
      </div>

      <MatchRecord :games="summary.games" :wins="summary.wins" :losses="summary.losses" />

      <section aria-labelledby="ranks-title">
        <h3 id="ranks-title" class="text-lg font-semibold text-slate-100">Rangos</h3>

        <div v-if="summary.ranks?.length" class="mt-4 space-y-4">
          <RankCard v-for="rank in summary.ranks" :key="`${rank.platform}-${rank.queue_type}`" :rank="rank" />
        </div>

        <p v-else class="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">
          Sin clasificar
        </p>
      </section>
    </div>
  </section>
</template>
