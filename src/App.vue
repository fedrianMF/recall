<script setup>
import { RouterView, useRoute } from 'vue-router'
import AppShell from './components/shell/AppShell.vue'
import AuthLayout from './components/auth/AuthLayout.vue'
import RequireAccounts from './components/accounts/RequireAccounts.vue'
import { watch } from 'vue'
import { useSync } from './composables/useSync'
import { useAccounts } from './composables/useAccounts'

const route = useRoute()
const { completedCount } = useSync()
const { load: loadAccounts } = useAccounts()
watch(completedCount, (count, previousCount) => {
  if (count !== previousCount) {
    document.querySelector('#main')?.focus()
    loadAccounts().catch(() => {})
  }
})
</script>

<template>
  <AuthLayout v-if="route.meta.layout === 'auth'"><RouterView /></AuthLayout>
  <AppShell v-else>
    <RequireAccounts v-if="route.meta.needsAccounts"
      ><RouterView :key="completedCount"
    /></RequireAccounts>
    <RouterView
      v-else
      :key="completedCount"
    />
  </AppShell>
</template>
