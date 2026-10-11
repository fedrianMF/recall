<script setup>
defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => ['summary', 'champions', 'history'].includes(value),
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
    <template v-if="name === 'summary'">
      <rect
        x="3.5"
        y="3.5"
        width="7"
        height="9"
        rx="2"
      />
      <rect
        x="13.5"
        y="3.5"
        width="7"
        height="5"
        rx="2"
      />
      <rect
        x="13.5"
        y="11.5"
        width="7"
        height="9"
        rx="2"
      />
      <rect
        x="3.5"
        y="15.5"
        width="7"
        height="5"
        rx="2"
      />
    </template>

    <template v-else-if="name === 'champions'">
      <path d="M12 3l7 2.8v5.4c0 4.3-2.9 7.8-7 9.8-4.1-2-7-5.5-7-9.8V5.8z" />
      <path d="M9 10.5l3 2.5 3-2.5" />
    </template>

    <template v-else>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle
        cx="4.5"
        cy="6"
        r="1"
      />
      <circle
        cx="4.5"
        cy="12"
        r="1"
      />
      <circle
        cx="4.5"
        cy="18"
        r="1"
      />
    </template>
  </svg>
</template>
