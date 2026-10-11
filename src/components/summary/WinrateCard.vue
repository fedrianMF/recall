<script setup>
import { useId } from 'vue'
import WinrateRing from './WinrateRing.vue'

defineProps({
  winrate: {
    type: Number,
    default: null,
  },
  wins: {
    type: Number,
    required: true,
  },
  losses: {
    type: Number,
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
      Winrate
    </h2>

    <div class="flex flex-1 flex-col items-center gap-6 sm:flex-row sm:justify-between sm:gap-3">
      <div class="min-w-0 self-start sm:self-auto">
        <p
          v-if="winrate !== null"
          class="flex items-start font-display text-[76px] leading-none font-bold tracking-tight tabular-nums md:text-[116px]"
        >
          <span>{{ winrate }}</span>
          <span class="mt-[0.12em] text-[0.4em] text-win">%</span>
        </p>
        <p
          v-else
          class="font-display text-[76px] leading-none font-bold tracking-tight md:text-[116px]"
        >
          —
        </p>

        <p class="mt-3 max-w-52 text-sm leading-relaxed text-ink-muted">de las partidas ganadas.</p>

        <span
          v-if="winrate !== null && winrate > 50"
          class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-win-soft px-3 py-2 text-xs font-semibold text-win-text"
        >
          <span aria-hidden="true">✓</span>
          Por encima del 50%
        </span>
      </div>

      <div class="w-full max-w-[200px] shrink-0 sm:w-2/5 sm:max-w-[232px]">
        <WinrateRing
          :winrate="winrate"
          :wins="wins"
          :losses="losses"
        />
      </div>
    </div>

    <ul class="flex flex-wrap items-center gap-4 border-t border-divider pt-4 text-sm">
      <li class="inline-flex items-center gap-2 text-win-text">
        <span aria-hidden="true">✓</span>
        <span>Victorias</span>
      </li>
      <li class="inline-flex items-center gap-2 text-loss-text">
        <span aria-hidden="true">✕</span>
        <span>Derrotas</span>
      </li>
    </ul>
  </section>
</template>
