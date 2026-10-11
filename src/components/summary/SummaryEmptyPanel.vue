<script setup>
defineProps({
  title: {
    type: String,
    default: 'Aún no hay partidas registradas para esta cuenta.',
  },
  description: {
    type: String,
    default: 'Cuando juegues, aparecerán aquí tus estadísticas.',
  },
})
</script>

<template>
  <div class="rounded-2xl bg-surface p-8 text-center text-ink shadow-card">
    <h2 class="font-display text-xl font-bold tracking-tight">{{ title }}</h2>
    <p class="mt-2 text-sm text-ink-muted">{{ description }}</p>
  </div>
</template>
