<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'

const selectedAccount = ref('')
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <AppHeader v-model="selectedAccount" />

    <main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RouterView :account="selectedAccount" />
    </main>
  </div>
</template>
