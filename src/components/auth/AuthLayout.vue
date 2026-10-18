<script setup>
import AppLogo from '../AppLogo.vue'
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-sage px-5 py-8">
    <div class="w-full max-w-md">
      <div class="mb-6 flex items-center justify-center gap-3 text-rail">
        <span class="flex size-11 items-center justify-center rounded-full bg-rail text-on-dark">
          <AppLogo class="size-6" />
        </span>
        <span class="font-display text-2xl font-bold">Recall</span>
      </div>
      <slot />
    </div>
  </main>
</template>
