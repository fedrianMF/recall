<script setup>
import { RouterLink } from 'vue-router'
</script>
<template>
  <section class="rounded-2xl bg-surface p-8 text-center shadow-card">
    <h2 class="font-display text-2xl font-bold text-ink">Aún no tienes cuentas vinculadas</h2>
    <p class="mt-2 text-ink-muted">Vincula una cuenta para empezar a ver tus partidas.</p>
    <RouterLink
      class="mt-5 inline-flex min-h-11 items-center rounded-control bg-rail px-5 font-semibold text-on-dark"
      to="/accounts"
      >Vincular cuenta</RouterLink
    >
  </section>
</template>
