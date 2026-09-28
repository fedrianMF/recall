<template>
  <main class="min-h-screen bg-sage p-8 text-ink">
    <h1 class="text-3xl font-bold">Recall - Nuevo diseño</h1>

    <section class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article class="overflow-hidden rounded-xl bg-surface shadow-sm">
        <div class="h-24 bg-rail"></div>

        <div class="p-4">
          <h2 class="font-semibold">Riel</h2>
          <p class="mt-1 text-sm text-ink-muted">#0B0C0B</p>
        </div>
      </article>

      <article class="overflow-hidden rounded-xl bg-surface shadow-sm">
        <div class="h-24 bg-charcoal"></div>

        <div class="p-4">
          <h2 class="font-semibold">Carbón</h2>
          <p class="mt-1 text-sm text-ink-muted">#1C1E1D</p>
        </div>
      </article>

      <article class="overflow-hidden rounded-xl bg-surface shadow-sm">
        <div class="h-24 border-b border-divider bg-surface"></div>

        <div class="p-4">
          <h2 class="font-semibold">Superficie</h2>
          <p class="mt-1 text-sm text-ink-muted">#FFFFFF</p>
        </div>
      </article>

      <article class="overflow-hidden rounded-xl bg-surface shadow-sm">
        <div class="h-24 bg-win"></div>

        <div class="p-4">
          <h2 class="font-semibold">Victoria</h2>
          <p class="mt-1 text-sm text-ink-muted">#2B874C</p>
        </div>
      </article>

      <article class="overflow-hidden rounded-xl bg-surface shadow-sm">
        <div class="h-24 bg-loss"></div>

        <div class="p-4">
          <h2 class="font-semibold">Derrota</h2>
          <p class="mt-1 text-sm text-ink-muted">#E0401F</p>
        </div>
      </article>

      <article class="overflow-hidden rounded-xl bg-surface shadow-sm">
        <div class="h-24 bg-sky"></div>

        <div class="p-4">
          <h2 class="font-semibold">Celeste</h2>
          <p class="mt-1 text-sm text-ink-muted">#3A9BD1</p>
        </div>
      </article>
    </section>

    <div class="mt-8 flex flex-wrap gap-3">
      <span class="rounded-full bg-win-soft px-4 py-2 font-semibold text-win-text">
        ✓ Victoria
      </span>
      <span class="rounded-full bg-loss-soft px-4 py-2 font-semibold text-loss-text">
        ✕ Derrota
      </span>
    </div>
  </main>
</template>
