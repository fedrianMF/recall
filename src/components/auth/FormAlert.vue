<script setup>
defineProps({ message: { type: String, required: true } })
</script>

<template>
  <p
    tabindex="-1"
    role="alert"
    class="rounded-control border border-danger-border bg-danger-soft px-3 py-2 text-sm text-danger-fg-strong"
  >
    {{ message }}
  </p>
</template>
