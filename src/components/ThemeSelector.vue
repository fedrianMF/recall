<script setup>
import { useTheme } from '../composables/useTheme'

const { mode, setMode } = useTheme()

const options = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]
</script>

<template>
  <div
    role="group"
    aria-label="Tema"
    class="flex gap-1 rounded-full border border-line bg-card p-1"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="mode === option.value"
      :aria-label="option.label"
      :title="option.label"
      class="flex size-11 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:size-9"
      :class="mode === option.value ? 'bg-fg text-page' : 'text-fg-muted hover:text-fg'"
      @click="setMode(option.value)"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <template v-if="option.value === 'system'">
          <rect
            x="3"
            y="4"
            width="18"
            height="12"
            rx="2"
          />
          <path d="M8 20h8M12 16v4" />
        </template>
        <template v-else-if="option.value === 'light'">
          <circle
            cx="12"
            cy="12"
            r="4"
          />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        </template>
        <path
          v-else
          d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
        />
      </svg>
    </button>
  </div>
</template>
