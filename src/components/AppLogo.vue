<script setup>
// Recall symbol: a ring, an arrow and a dot (the "replay" idea).
// It paints with `currentColor`, so the parent picks the color through the
// text color: white on a dark background today, dark ink on a light theme later.
// Size it from the outside: <AppLogo class="size-8" />
</script>

<template>
  <svg
    viewBox="8 5 54 54"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M32 14A18 18 0 1 0 50 32"
      stroke="currentColor"
      stroke-width="7"
    />
    <path
      d="M40 33h20L50 18z"
      fill="currentColor"
    />
    <circle
      cx="32"
      cy="32"
      r="5"
      fill="currentColor"
    />
  </svg>
</template>
