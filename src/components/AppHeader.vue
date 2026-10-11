<script setup>
import { RouterLink } from 'vue-router'
import AccountSelector from './AccountSelector.vue'
import AppLogo from './AppLogo.vue'
import ThemeSelector from './ThemeSelector.vue'
import { useAccount } from '../composables/useAccount'

const { account, setAccount } = useAccount()
</script>

<template>
  <header class="border-b border-line bg-page/90">
    <div
      class="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8"
    >
      <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight text-fg">
        <AppLogo class="size-8" />
        Recall
      </h1>

      <nav
        aria-label="Navegación principal"
        class="order-3 flex w-full gap-1 sm:order-none sm:w-auto"
      >
        <RouterLink
          to="/"
          class="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition hover:bg-card hover:text-fg"
          exact-active-class="bg-card-raised text-accent"
        >
          Resumen
        </RouterLink>
        <RouterLink
          to="/champions"
          class="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition hover:bg-card hover:text-fg"
          active-class="bg-card-raised text-accent"
        >
          Campeones
        </RouterLink>
        <RouterLink
          to="/matches"
          class="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition hover:bg-card hover:text-fg"
          active-class="bg-card-raised text-accent"
        >
          Historial
        </RouterLink>
      </nav>

      <div class="ml-auto flex flex-wrap items-center gap-4">
        <AccountSelector
          :model-value="account"
          @update:model-value="setAccount"
        />
        <ThemeSelector />
      </div>
    </div>
  </header>
</template>
