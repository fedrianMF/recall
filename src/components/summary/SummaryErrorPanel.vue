<script setup>
defineProps({
  // Heading level of the title: 2 by default, 3 or 4 when nested inside a panel.
  headingLevel: {
    type: Number,
    default: 2,
    validator: (value) => [2, 3, 4].includes(value),
  },
  title: {
    type: String,
    default: 'No se pudo cargar el resumen',
  },
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
      <component
        :is="`h${headingLevel}`"
        class="text-base font-semibold text-danger-fg-strong"
      >
        {{ title }}
      </component>
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
