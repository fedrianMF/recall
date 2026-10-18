<script setup>
import { platformOptions } from '../../utils/accounts'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  accounts: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

function toggleAccount(value) {
  emit('update:modelValue', props.modelValue === value ? '' : value)
}
</script>

<template>
  <div
    role="group"
    aria-label="Seleccionar cuenta"
    class="flex gap-1 rounded-full bg-charcoal-deep p-1"
  >
    <button
      v-for="account in platformOptions(accounts)"
      :key="account.value"
      type="button"
      :aria-pressed="modelValue === account.value"
      class="min-h-11 flex-1 rounded-full px-4 text-sm transition-colors"
      :class="
        modelValue === account.value
          ? 'bg-surface font-semibold text-rail'
          : 'font-medium text-on-dark-muted hover:bg-charcoal-raised hover:text-on-dark'
      "
      @click="toggleAccount(account.value)"
    >
      {{ account.label }}
    </button>
  </div>
</template>
