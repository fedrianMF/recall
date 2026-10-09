<script setup>
import { RouterLink } from 'vue-router'
import AppLogo from '../components/AppLogo.vue'
</script>

<template>
  <section
    aria-labelledby="not-found-title"
    class="flex flex-col items-center py-16 text-center"
  >
    <AppLogo class="size-16 text-fg" />

    <p class="mt-6 text-6xl font-bold tracking-tight text-fg">404</p>
    <h2
      id="not-found-title"
      class="mt-2 text-2xl font-semibold tracking-tight"
    >
      Página no encontrada
    </h2>
    <p class="mt-2 text-fg-muted">La dirección que abriste no existe o fue movida.</p>

    <RouterLink
      to="/"
      class="mt-6 rounded-lg bg-fg px-4 py-2 text-sm font-semibold text-page transition hover:bg-fg/90 focus:outline-none focus:ring-2 focus:ring-accent"
    >
      Volver al resumen
    </RouterLink>
  </section>
</template>
