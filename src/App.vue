<script setup>
import { RouterView, useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'

const route = useRoute();
</script>

<template>
  <RouterView v-if="route.meta.layout === 'redesign'" />

  <div v-else class="min-h-screen bg-slate-950 text-slate-100">
    <AppHeader />

    <main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>
