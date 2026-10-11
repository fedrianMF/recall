<script setup>
import { useAccount } from '../../composables/useAccount'
import AccountSwitch from './AccountSwitch.vue'

const { account, setAccount } = useAccount()
</script>

<template>
  <aside
    aria-label="Tus cuentas"
    data-focus-theme="dark"
    class="hidden w-[280px] shrink-0 rounded-l-shell bg-charcoal px-6 py-8 text-on-dark xl:block"
  >
    <p class="mb-4 text-sm text-on-dark-muted">Tus cuentas</p>
    <AccountSwitch
      :model-value="account"
      @update:model-value="setAccount"
    />
  </aside>
</template>
