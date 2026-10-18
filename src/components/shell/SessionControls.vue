<script setup>
import { useSession } from '../../composables/useSession'

const { user, signOut } = useSession()
</script>

<template>
  <div class="flex items-center gap-3">
    <span class="min-w-0 truncate text-sm text-on-dark-muted">{{ user?.name }}</span>
    <button
      type="button"
      class="min-h-11 rounded-control px-3 text-sm font-semibold text-on-dark hover:bg-charcoal-hover"
      data-focus-theme="dark"
      @click="signOut"
    >
      Cerrar sesión
    </button>
  </div>
</template>
