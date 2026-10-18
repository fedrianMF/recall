<script setup>
import { RouterLink } from 'vue-router'
import { useAccount } from '../../composables/useAccount'
import AccountSwitch from './AccountSwitch.vue'
import SessionControls from './SessionControls.vue'
import { useAccounts } from '../../composables/useAccounts'
import SyncButton from './SyncButton.vue'

const { account, setAccount } = useAccount()
const { accounts } = useAccounts()
</script>

<template>
  <aside
    aria-label="Tus cuentas"
    data-focus-theme="dark"
    class="hidden w-[280px] shrink-0 rounded-l-shell bg-charcoal px-6 py-8 text-on-dark xl:block"
  >
    <SessionControls class="mb-5" />
    <p class="mb-4 text-sm text-on-dark-muted">Tus cuentas</p>
    <AccountSwitch
      :model-value="account"
      :accounts="accounts"
      @update:model-value="setAccount"
    />
    <ul class="mt-6 space-y-2 text-sm">
      <li
        v-for="linkedAccount in accounts"
        :key="linkedAccount.id"
      >
        {{ linkedAccount.game_name }}#{{ linkedAccount.tag_line }}
        <span class="text-on-dark-muted">· {{ linkedAccount.platform }}</span>
      </li>
    </ul>
    <RouterLink
      class="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-on-dark"
      to="/accounts"
      >Vincular cuenta</RouterLink
    >
    <div class="mt-6"><SyncButton /></div>
  </aside>
</template>
