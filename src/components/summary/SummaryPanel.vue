<script setup>
import { useId } from 'vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
})

const titleId = useId()
</script>

<template>
  <section
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
