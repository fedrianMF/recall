<script setup>
import { useId } from 'vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
})

const titleId = useId()

// Template note: the root <section> has tabindex="-1" so it is a non-interactive focus
// target for when a panel unmounts its retry button; the global focus ring is not drawn on it.
</script>

<template>
  <section
    tabindex="-1"
    :aria-labelledby="titleId"
    class="flex flex-col gap-4 rounded-2xl bg-surface p-6 text-ink shadow-card"
  >
    <h2
      :id="titleId"
      class="text-base font-semibold"
    >
      {{ title }}
    </h2>

    <slot />
  </section>
</template>
