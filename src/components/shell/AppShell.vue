<script setup>
import AppLogo from '../AppLogo.vue'
import AccountCompactSelect from './AccountCompactSelect.vue'
import ShellAccountPanel from './ShellAccountPanel.vue'
import ShellMobileNav from './ShellMobileNav.vue'
import ShellRail from './ShellRail.vue'
import SessionControls from './SessionControls.vue'
import EmailVerificationBanner from './EmailVerificationBanner.vue'
import SyncButton from './SyncButton.vue'
</script>

<template>
  <div
    class="flex min-h-screen flex-col bg-charcoal md:grid md:grid-cols-[72px_minmax(0,1fr)] md:bg-rail xl:grid-cols-[72px_280px_minmax(0,1fr)]"
  >
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-control focus:bg-surface focus:px-4 focus:text-sm focus:font-semibold focus:text-ink"
      >Saltar al contenido</a
    >

    <ShellRail />
    <ShellAccountPanel />

    <header
      data-focus-theme="dark"
      class="flex h-24 shrink-0 items-start gap-3 bg-charcoal px-5 pt-5 md:hidden"
    >
      <span
        role="img"
        aria-label="Recall"
        class="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-rail"
      >
        <AppLogo class="size-6" />
      </span>

      <AccountCompactSelect
        tone="dark"
        class="ml-auto"
      />
      <SessionControls />
      <SyncButton />
    </header>

    <main
      id="main"
      tabindex="-1"
      class="min-w-0 flex-1 rounded-t-shell bg-sage px-5 pt-6 pb-[120px] md:rounded-t-none md:rounded-l-shell md:px-8 md:py-8 lg:px-10"
    >
      <div class="mb-8 hidden items-center justify-end md:flex xl:hidden">
        <span
          aria-hidden="true"
          class="mr-3 text-sm font-medium text-ink-muted"
          >Cuenta</span
        >
        <AccountCompactSelect tone="light" />
        <SessionControls />
        <SyncButton />
      </div>

      <EmailVerificationBanner />
      <slot />
    </main>

    <ShellMobileNav />
  </div>
</template>
