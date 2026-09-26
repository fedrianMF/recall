<script setup>
import AccountSelector from './AccountSelector.vue'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <header class="border-b border-slate-800 bg-slate-950/90">
    <div
      class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
    >
      <h1 class="text-2xl font-bold tracking-tight text-cyan-400">Recall</h1>

      <AccountSelector
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
  </header>
</template>
