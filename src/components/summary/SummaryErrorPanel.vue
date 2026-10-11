<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
})

defineEmits(['retry'])
</script>

<template>
  <div
    role="alert"
    class="flex flex-col gap-4 rounded-2xl border border-danger-border bg-danger-soft p-6 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="space-y-1">
      <h2 class="text-base font-semibold text-danger-fg-strong">No se pudo cargar el resumen</h2>
      <p class="text-sm text-danger-fg">{{ message }}</p>
    </div>

    <button
      type="button"
      class="min-h-11 shrink-0 rounded-control bg-danger-solid px-5 text-sm font-semibold text-on-dark transition-colors hover:bg-danger-solid-hover"
      @click="$emit('retry')"
    >
      Reintentar
    </button>
  </div>
</template>
