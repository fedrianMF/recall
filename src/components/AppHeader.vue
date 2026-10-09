<script setup>
import { RouterLink } from 'vue-router'
import AccountSelector from './AccountSelector.vue'
import AppLogo from './AppLogo.vue'
import { useAccount } from '../composables/useAccount'

const { account } = useAccount()
</script>

<template>
  <header class="border-b border-slate-800 bg-slate-950/90">
    <div
      class="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8"
    >
      <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
        <AppLogo class="size-8" />
        Recall
      </h1>

      <nav
        aria-label="Navegación principal"
        class="order-3 flex w-full gap-1 sm:order-none sm:w-auto"
      >
        <RouterLink
          to="/"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-slate-100"
          exact-active-class="bg-slate-800 text-cyan-400"
        >
          Resumen
        </RouterLink>
        <RouterLink
          to="/champions"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-slate-100"
          active-class="bg-slate-800 text-cyan-400"
        >
          Campeones
        </RouterLink>
        <RouterLink
          to="/matches"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-slate-100"
          active-class="bg-slate-800 text-cyan-400"
        >
          Historial
        </RouterLink>
      </nav>

      <div class="ml-auto">
        <AccountSelector v-model="account" />
      </div>
    </div>
  </header>
</template>
