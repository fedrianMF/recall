<script setup>
import { RouterLink } from 'vue-router'
import AppLogo from '../components/AppLogo.vue'
</script>

<template>
  <section
    aria-labelledby="not-found-title"
    class="flex flex-col items-center py-16 text-center"
  >
    <AppLogo class="size-16 text-ink" />

    <p class="mt-6 font-display text-6xl font-bold tracking-tight text-ink">404</p>
    <h1
      id="not-found-title"
      class="mt-2 font-display text-2xl font-bold text-ink"
    >
      Página no encontrada
    </h1>
    <p class="mt-2 text-ink-muted">La dirección que abriste no existe o fue movida.</p>

    <RouterLink
      to="/"
      class="mt-6 inline-flex min-h-11 items-center rounded-control bg-rail px-5 text-sm font-semibold text-on-dark transition-colors hover:bg-charcoal-hover"
    >
      Volver al resumen
    </RouterLink>
  </section>
</template>
