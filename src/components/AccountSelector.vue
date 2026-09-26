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
  <label class="flex items-center gap-3 text-sm font-medium text-slate-300">
    <span>Cuenta</span>
    <select
      :value="modelValue"
      class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="">Ambas</option>
      <option value="la1">LAN</option>
      <option value="la2">LAS</option>
    </select>
  </label>
</template>
