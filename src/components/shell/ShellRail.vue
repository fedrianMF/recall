<script setup>
import { RouterLink } from 'vue-router'
import AppLogo from '../AppLogo.vue'
import NavIcon from './NavIcon.vue'
import { isNavItemActive, navItems } from './navItems'
</script>

<template>
  <nav
    aria-label="Navegación principal"
    data-focus-theme="dark"
    class="hidden w-[72px] shrink-0 flex-col items-center gap-3 bg-rail py-6 md:flex"
  >
    <span
      role="img"
      aria-label="Recall"
      class="mb-9 flex size-11 items-center justify-center rounded-full bg-surface text-rail"
    >
      <AppLogo class="size-6" />
    </span>

    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      :aria-label="item.label"
      :title="item.label"
      class="group rounded-full"
      v-slot="{ isActive, isExactActive }"
    >
      <span
        class="flex size-12 items-center justify-center rounded-full transition-colors"
        :class="
          isNavItemActive(item, isActive, isExactActive)
            ? 'bg-surface text-rail'
            : 'bg-rail-item text-rail-icon group-hover:bg-rail-item-hover group-hover:text-on-dark'
        "
      >
        <NavIcon
          :name="item.icon"
          class="size-[22px]"
        />
      </span>
    </RouterLink>
  </nav>
</template>
