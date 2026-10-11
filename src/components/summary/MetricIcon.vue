<script setup>
defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => ['kda', 'cs', 'damage', 'vision', 'participation'].includes(value),
  },
})
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'kda'">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6M16 16l4 4M19 21l2-2" />
    </template>

    <template v-else-if="name === 'cs'">
      <circle
        cx="9"
        cy="9"
        r="5.5"
      />
      <path d="M14.2 7.1A5.5 5.5 0 1 1 7.1 14.2" />
    </template>

    <template v-else-if="name === 'damage'">
      <path d="M13 2.5L4.5 13.5H12l-1 8 8.5-11H12z" />
    </template>

    <template v-else-if="name === 'vision'">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle
        cx="12"
        cy="12"
        r="3"
      />
    </template>

    <template v-else>
      <circle
        cx="9"
        cy="8"
        r="3.5"
      />
      <path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.5 3.5 5.2" />
    </template>
  </svg>
</template>
