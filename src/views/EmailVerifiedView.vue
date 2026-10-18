<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useSession } from '../composables/useSession'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, refreshUser } = useSession()
const status = computed(() => route.query.status)
const isSuccess = computed(() => status.value === 'ok' || status.value === 'already')
const title = computed(() =>
  status.value === 'ok'
    ? 'Tu correo quedó verificado'
    : status.value === 'already'
      ? 'Tu correo ya estaba verificado'
      : 'El enlace no es válido o venció',
)

onMounted(() => {
  if (isAuthenticated.value) refreshUser().catch(() => {})
})
function continueToApp() {
  router.push(isAuthenticated.value ? '/' : '/login')
}
</script>

<template>
  <section
    class="rounded-shell bg-surface p-6 text-center shadow-card md:p-8"
    aria-labelledby="verified-title"
  >
    <p
      class="text-3xl"
      aria-hidden="true"
    >
      {{ isSuccess ? '✓' : '!' }}
    </p>
    <h1
      id="verified-title"
      class="mt-3 font-display text-3xl font-bold text-ink"
    >
      {{ title }}
    </h1>
    <p
      v-if="!isSuccess"
      class="mt-3 text-sm text-ink-muted"
    >
      Inicia sesión para solicitar un nuevo correo de verificación.
    </p>
    <button
      v-if="isSuccess"
      type="button"
      class="mt-6 min-h-11 rounded-control bg-rail px-5 font-semibold text-on-dark"
      @click="continueToApp"
    >
      Continuar
    </button>
    <RouterLink
      v-else
      class="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-sky-text"
      to="/login"
      >Ir a iniciar sesión</RouterLink
    >
  </section>
</template>
