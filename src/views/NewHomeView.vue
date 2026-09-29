<template>
  <div class="grid min-h-screen grid-cols-[72px_280px_minmax(0,1fr)] bg-rail">
    <nav aria-label="Navegación principal" class="flex flex-col items-center gap-3 py-6 bg-rail text-white">
      <div class="flex size-11 items-center justify-center rounded-full bg-surface font-bold text-rail">R</div>
      <button type="button" aria-label="Resumen" aria-current="page"
        class="flex size-12 items-center justify-center rounded-full bg-surface text-rail">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <rect x="3.5" y="3.5" width="7" height="9" rx="2"></rect>
          <rect x="13.5" y="3.5" width="7" height="5" rx="2"></rect>
          <rect x="13.5" y="11.5" width="7" height="9" rx="2"></rect>
          <rect x="3.5" y="15.5" width="7" height="5" rx="2"></rect>
        </svg>
      </button>
      <button type="button" aria-label="Campeones"
        class="flex size-12 items-center justify-center rounded-full bg-rail-item text-rail-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3l7 2.8v5.4c0 4.3-2.9 7.8-7 9.8-4.1-2-7-5.5-7-9.8V5.8z"></path>
          <path d="M9 10.5l3 2.5 3-2.5"></path>
        </svg>
      </button>
      <button type="button" aria-label="Historial"
        class="flex size-12 items-center justify-center rounded-full bg-rail-item text-rail-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 6h11M9 12h11M9 18h11"></path>
          <circle cx="4.5" cy="6" r="1"></circle>
          <circle cx="4.5" cy="12" r="1"></circle>
          <circle cx="4.5" cy="18" r="1"></circle>
        </svg>
      </button>
      <div class="grow"></div>
      <button type="button" aria-label="Configuración"
        class="flex size-12 items-center justify-center rounded-full bg-rail-item text-rail-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 7h9M17 7h3M4 17h3M11 17h9"></path>
          <circle cx="15" cy="7" r="2"></circle>
          <circle cx="9" cy="17" r="2"></circle>
        </svg>
      </button>
    </nav>
    <aside aria-label="Tus cuentas" class="rounded-l-[20px] bg-charcoal px-6 py-8 text-white">
      <p class="text-sm text-white/60">Tus cuentas</p>

      <div role="group" aria-label="Seleccionar cuenta" class="mt-4 flex gap-1 rounded-full bg-charcoal-deep p-1">
        <button type="button" aria-pressed="true"
          class="h-10 flex-1 rounded-full bg-surface text-sm font-semibold text-rail">LAN</button>
        <button type="button" aria-pressed="false"
          class="h-10 flex-1 rounded-full text-sm font-medium text-on-dark-muted">LAS</button>
      </div>
    </aside>
  </div>
</template>
