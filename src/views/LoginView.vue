<script setup>
import { nextTick, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthField from '../components/auth/AuthField.vue'
import FormAlert from '../components/auth/FormAlert.vue'
import { useSession } from '../composables/useSession'

const router = useRouter()
const route = useRoute()
const { signIn } = useSession()
const form = reactive({ email: '', password: '' })
const fieldErrors = ref({})
const alert = ref('')
const isSubmitting = ref(false)

function destination() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  return redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'
}

async function submit() {
  fieldErrors.value = {}
  alert.value = ''
  isSubmitting.value = true

  try {
    await signIn(form)
    await router.push(destination())
  } catch (error) {
    if (error.code === 'invalid_credentials' || error.status === 401) {
      alert.value = 'Correo o contraseña incorrectos.'
    } else if (error.status === 422 && error.errors) {
      fieldErrors.value = error.errors
    } else {
      alert.value = 'No se pudo iniciar sesión. Inténtalo de nuevo.'
    }
    await nextTick()
    document.querySelector('[aria-invalid="true"]')?.focus()
    if (alert.value) document.querySelector('[role="alert"]')?.focus()
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section
    class="rounded-shell bg-surface p-6 shadow-card md:p-8"
    aria-labelledby="login-title"
  >
    <h1
      id="login-title"
      class="font-display text-3xl font-bold text-ink"
    >
      Iniciar sesión
    </h1>
    <p class="mt-2 text-sm text-ink-muted">Vuelve a tus estadísticas y sesiones de juego.</p>
    <form
      class="mt-6 space-y-4"
      @submit.prevent="submit"
    >
      <FormAlert
        v-if="alert"
        :message="alert"
      />
      <AuthField
        v-model="form.email"
        id="email"
        label="Correo electrónico"
        type="email"
        autocomplete="email"
        :error="fieldErrors.email?.[0]"
      />
      <AuthField
        v-model="form.password"
        id="password"
        label="Contraseña"
        type="password"
        autocomplete="current-password"
        :error="fieldErrors.password?.[0]"
      />
      <button
        type="submit"
        class="min-h-11 w-full rounded-control bg-rail px-4 font-semibold text-on-dark"
        :disabled="isSubmitting"
        :aria-busy="isSubmitting"
      >
        {{ isSubmitting ? 'Entrando…' : 'Entrar' }}
      </button>
    </form>
    <p class="mt-5 text-center text-sm text-ink-muted">
      ¿No tienes cuenta?
      <RouterLink
        class="font-semibold text-sky-text"
        to="/register"
        >Crear cuenta</RouterLink
      >
    </p>
  </section>
</template>
