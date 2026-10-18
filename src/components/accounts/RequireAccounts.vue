<script setup>
import { onMounted } from 'vue'
import { useAccounts } from '../../composables/useAccounts'
import NoAccountsPanel from './NoAccountsPanel.vue'

const { accounts, isLoading, error, hasLoaded, load } = useAccounts()
onMounted(() => {
  if (!hasLoaded.value) load().catch(() => {})
})
</script>
<template>
  <div
    v-if="isLoading || (!hasLoaded && !error)"
    role="status"
    class="h-48 animate-pulse motion-reduce:animate-none rounded-2xl bg-surface-muted"
  ></div>
  <section
    v-else-if="error"
    class="rounded-2xl bg-surface p-6 shadow-card"
  >
    <h1 class="font-display text-2xl font-bold">No se pudieron cargar tus cuentas</h1>
    <button
      class="mt-4 min-h-11 rounded-control bg-rail px-4 font-semibold text-on-dark"
      @click="load"
    >
      Reintentar
    </button>
  </section>
  <NoAccountsPanel v-else-if="accounts.length === 0" />
  <slot v-else />
</template>
