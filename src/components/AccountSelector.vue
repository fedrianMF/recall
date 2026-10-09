<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="flex items-center gap-3 text-sm font-medium text-fg-soft">
    <span>Cuenta</span>
    <select
      :value="modelValue"
      class="rounded-lg border border-line-strong bg-card px-3 py-2 text-sm text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="">Ambas</option>
      <option value="la1">LAN</option>
      <option value="la2">LAS</option>
    </select>
  </label>
</template>
