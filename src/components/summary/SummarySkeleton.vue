<template>
  <div
    role="status"
    class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
  >
    <span class="sr-only">Cargando resumen…</span>

    <!-- Same grid areas as the real content, so the page does not jump when data arrives -->
    <div
      aria-hidden="true"
      class="h-72 animate-pulse motion-reduce:animate-none rounded-2xl bg-surface-muted lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:h-full"
    ></div>
    <div
      aria-hidden="true"
      class="h-40 animate-pulse motion-reduce:animate-none rounded-2xl bg-surface-muted lg:col-start-2 lg:row-start-1"
    ></div>
    <div
      aria-hidden="true"
      class="h-56 animate-pulse motion-reduce:animate-none rounded-2xl bg-surface-muted lg:col-start-2 lg:row-start-2"
    ></div>

    <div
      aria-hidden="true"
      class="mt-3 flex flex-col gap-3.5 lg:col-span-2 lg:row-start-3"
    >
      <div
        class="h-5 w-48 animate-pulse motion-reduce:animate-none rounded-control bg-surface-muted"
      ></div>
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-5">
        <div
          v-for="index in 5"
          :key="index"
          class="h-32 animate-pulse motion-reduce:animate-none rounded-metric bg-surface-muted last:col-span-2 md:last:col-span-1"
        ></div>
      </div>
    </div>
  </div>
</template>
