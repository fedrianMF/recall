<script setup>
import { RouterLink } from 'vue-router'
import NavIcon from './NavIcon.vue'
import { navItems } from './navItems'

function isNavItemActive(item, isActive, isExactActive) {
  return item.to === '/' ? isExactActive : isActive
}
</script>

<template>
  <nav
    aria-label="Navegación principal"
    data-focus-theme="dark"
    class="fixed right-4 bottom-5 left-4 z-50 grid h-[72px] grid-cols-3 gap-1 rounded-2xl bg-rail p-2 shadow-float md:hidden"
  >
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="group min-h-11 rounded-xl"
      v-slot="{ isActive, isExactActive }"
    >
      <span
        class="flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl text-xs transition-colors"
        :class="
          isNavItemActive(item, isActive, isExactActive)
            ? 'bg-surface font-semibold text-rail'
            : 'text-rail-icon group-hover:bg-rail-item group-hover:text-on-dark'
        "
      >
        <NavIcon
          :name="item.icon"
          class="size-5"
        />
        <span>{{ item.label }}</span>
      </span>
    </RouterLink>
  </nav>
</template>
