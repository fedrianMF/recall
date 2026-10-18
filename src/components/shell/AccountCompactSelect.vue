<script setup>
import { computed, watch } from 'vue'
import { useAccount } from '../../composables/useAccount'
import { platformOptions } from '../../utils/accounts'
import { useAccounts } from '../../composables/useAccounts'

const props = defineProps({
  tone: {
    type: String,
    default: 'dark',
    validator: (value) => ['dark', 'light'].includes(value),
  },
})

const { account, setAccount } = useAccount()
const { accounts } = useAccounts()
const availableOptions = computed(() => platformOptions(accounts.value))
watch(availableOptions, (options) => {
  if (account.value && !options.some((option) => option.value === account.value)) setAccount('')
})

const focusTheme = computed(() => (props.tone === 'dark' ? 'dark' : undefined))

const selectClasses = computed(() => (props.tone === 'dark' ? 'rounded-full' : 'rounded-control'))

function handleAccountChange(event) {
  setAccount(event.target.value)
}
</script>

<template>
  <label>
    <span class="sr-only">Cuenta</span>
    <select
      :value="account"
      :data-focus-theme="focusTheme"
      class="min-h-11 border-0 bg-charcoal-raised px-4 text-sm font-semibold text-on-dark"
      :class="selectClasses"
      @change="handleAccountChange"
    >
      <option value="">Ambas</option>
      <option
        v-for="option in availableOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
