<script setup>
import { useAccount } from '../composables/useAccount'
import { useSummary } from '../composables/useSummary'
import AppShell from '../components/shell/AppShell.vue'
import MatchesPanel from '../components/summary/MatchesPanel.vue'
import WinrateCard from '../components/summary/WinrateCard.vue'

const { account } = useAccount()
const { summary } = useSummary(account)
</script>

<template>
  <AppShell>
    <div class="space-y-7">
      <h1 class="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
        Resumen de rendimiento
      </h1>

      <div
        v-if="summary"
        class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
      >
        <WinrateCard
          :winrate="summary.winrate"
          :wins="summary.wins"
          :losses="summary.losses"
        />
        <MatchesPanel
          class="self-start"
          :games="summary.games"
          :wins="summary.wins"
          :losses="summary.losses"
        />
      </div>

      <!-- R2c adds loading, empty and error states -->
    </div>
  </AppShell>
</template>
