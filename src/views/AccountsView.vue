<script setup>
import { computed, onMounted } from 'vue'
import LinkAccountForm from '../components/accounts/LinkAccountForm.vue'
import { useAccounts } from '../composables/useAccounts'
import { platformLabel } from '../utils/accounts'

const { accounts, isLoading, error, load, add } = useAccounts()
onMounted(() => {
  if (!accounts.value.length) load().catch(() => {})
})
const hasAccounts = computed(() => accounts.value.length > 0)
</script>

<template>
  <section
    aria-labelledby="accounts-title"
    class="space-y-6"
  >
    <div>
      <h1
        id="accounts-title"
        class="font-display text-3xl font-bold text-ink"
      >
        Cuentas
      </h1>
      <p class="mt-1 text-sm text-ink-muted">Administra tus cuentas de League of Legends.</p>
    </div>
    <div
      v-if="isLoading"
      role="status"
      class="h-32 animate-pulse motion-reduce:animate-none rounded-2xl bg-surface-muted"
    ></div>
    <p
      v-else-if="error"
      role="alert"
      class="rounded-control bg-danger-soft p-4 text-danger-fg"
    >
      No se pudieron cargar tus cuentas.
      <button
        class="font-semibold underline"
        @click="load"
      >
        Reintentar
      </button>
    </p>
    <ul
      v-else-if="hasAccounts"
      class="space-y-3"
    >
      <li
        v-for="account in accounts"
        :key="account.id"
        class="rounded-2xl bg-surface p-4 shadow-card"
      >
        <span class="font-semibold">{{ account.game_name }}#{{ account.tag_line }}</span
        ><span class="ml-2 text-sm text-ink-muted">{{ platformLabel(account.platform) }}</span>
      </li>
    </ul>
    <LinkAccountForm @linked="add" />
  </section>
</template>
