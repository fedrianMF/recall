<script setup>
import { computed } from 'vue'
import { useAccount } from '../../composables/useAccount'

const props = defineProps({
  tone: {
    type: String,
    default: 'dark',
    validator: (value) => ['dark', 'light'].includes(value),
  },
})

const { account, setAccount } = useAccount()

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
      <option value="la1">LAN</option>
      <option value="la2">LAS</option>
    </select>
  </label>
</template>
