<script setup>
import { computed } from 'vue'
import { useAccount } from '../composables/useAccount'
import { useSummary } from '../composables/useSummary'
import AppShell from '../components/shell/AppShell.vue'
import MatchesPanel from '../components/summary/MatchesPanel.vue'
import PerformanceMetricCard from '../components/summary/PerformanceMetricCard.vue'
import RankPanel from '../components/summary/RankPanel.vue'
import SummaryEmptyPanel from '../components/summary/SummaryEmptyPanel.vue'
import SummaryErrorPanel from '../components/summary/SummaryErrorPanel.vue'
import SummarySkeleton from '../components/summary/SummarySkeleton.vue'
import WinrateCard from '../components/summary/WinrateCard.vue'
import { formatMetric } from '../utils/formatMetric'

const { account } = useAccount()
const { summary, isLoading, error, loadSummary } = useSummary(account)

// Backend gap: when an account has several queues, we will let the user choose.
// For now we show the first one.
const mainRank = computed(() => summary.value?.ranks?.[0] ?? null)

// Only the very first load (no data yet) replaces the page with the skeleton.
// A refresh keeps the old data visible and only changes the button.
const isInitialLoading = computed(() => isLoading.value && !summary.value)
const isEmpty = computed(() => summary.value?.games === 0)
</script>

<template>
  <AppShell>
    <div class="space-y-7">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h1 class="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Resumen de rendimiento
        </h1>

        <button
          type="button"
          class="inline-flex min-h-11 items-center gap-2.5 rounded-control bg-rail px-5 text-sm font-semibold text-on-dark transition-colors hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="isLoading"
          :aria-busy="isLoading"
          @click="loadSummary"
        >
          <svg
            class="size-[18px]"
            :class="{ 'animate-spin': isLoading }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5" />
            <path d="M4 4v4.5h4.5" />
            <path d="M4 13a8 8 0 0 0 14.3 4.3L20 15.5" />
            <path d="M20 20v-4.5h-4.5" />
          </svg>
          {{ isLoading ? 'Actualizando…' : 'Actualizar' }}
        </button>
      </div>

      <!-- Shown above the data when a refresh fails, so old numbers stay visible -->
      <SummaryErrorPanel
        v-if="error"
        :message="error.message"
        @retry="loadSummary"
      />

      <SummarySkeleton v-if="isInitialLoading" />

      <SummaryEmptyPanel v-else-if="isEmpty" />

      <div
        v-else-if="summary"
        class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
      >
        <WinrateCard
          class="lg:col-start-1 lg:row-span-2 lg:row-start-1"
          :winrate="summary.winrate"
          :wins="summary.wins"
          :losses="summary.losses"
        />
        <MatchesPanel
          class="self-start lg:col-start-2 lg:row-start-1"
          :games="summary.games"
          :wins="summary.wins"
          :losses="summary.losses"
        />

        <section
          aria-labelledby="performance-title"
          class="mt-3 flex flex-col gap-3.5 lg:col-span-2 lg:row-start-3"
        >
          <h2
            id="performance-title"
            class="text-base font-semibold text-ink"
          >
            Rendimiento en partida
          </h2>
          <div class="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-5">
            <PerformanceMetricCard
              label="KDA"
              icon="kda"
              caption="(K + A) / muertes"
              :value="formatMetric(summary.kda)"
            />
            <PerformanceMetricCard
              label="CS/min"
              icon="cs"
              caption="súbditos por minuto"
              :value="formatMetric(summary.cs_per_min)"
            />
            <PerformanceMetricCard
              label="Daño/min"
              icon="damage"
              caption="a campeones por minuto"
              :value="formatMetric(summary.damage_per_min)"
            />
            <PerformanceMetricCard
              label="Visión/min"
              icon="vision"
              caption="puntuación de visión"
              :value="formatMetric(summary.vision_per_min)"
            />
            <PerformanceMetricCard
              class="col-span-2 md:col-span-1"
              label="Participación"
              icon="participation"
              :value="formatMetric(summary.kill_participation, '%')"
              :progress="summary.kill_participation"
            />
          </div>
        </section>

        <RankPanel
          class="self-start lg:col-start-2 lg:row-start-2"
          :rank="mainRank"
        />
      </div>
    </div>
  </AppShell>
</template>
