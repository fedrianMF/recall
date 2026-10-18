<script setup>
import { nextTick, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthField from '../components/auth/AuthField.vue'
import FormAlert from '../components/auth/FormAlert.vue'
import { useSession } from '../composables/useSession'

const router = useRouter()
const { signUp } = useSession()
const form = reactive({ name: '', email: '', password: '', passwordConfirmation: '' })
const fieldErrors = ref({})
const alert = ref('')
const isSubmitting = ref(false)

async function submit() {
  fieldErrors.value = {}
  alert.value = ''
  if (form.password !== form.passwordConfirmation) {
    fieldErrors.value = { passwordConfirmation: ['Las contraseñas no coinciden.'] }
    await nextTick()
    document.querySelector('#passwordConfirmation')?.focus()
    return
  }

  isSubmitting.value = true
  try {
    await signUp(form)
    await router.push('/')
  } catch (error) {
    if (error.status === 403) alert.value = 'El registro está cerrado por ahora.'
    else if (error.status === 429) alert.value = 'Demasiados intentos. Espera un momento.'
    else if (error.status === 422 && error.errors) fieldErrors.value = error.errors
    else alert.value = 'No se pudo crear la cuenta. Inténtalo de nuevo.'
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
    aria-labelledby="register-title"
  >
    <h1
      id="register-title"
      class="font-display text-3xl font-bold text-ink"
    >
      Crear cuenta
    </h1>
    <p class="mt-2 text-sm text-ink-muted">Empieza a reunir tu historial de partidas.</p>
    <form
      class="mt-6 space-y-4"
      @submit.prevent="submit"
    >
      <FormAlert
        v-if="alert"
        :message="alert"
      />
      <AuthField
        v-model="form.name"
        id="name"
        label="Nombre"
        autocomplete="name"
        :error="fieldErrors.name?.[0]"
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
        autocomplete="new-password"
        :error="fieldErrors.password?.[0]"
      />
      <AuthField
        v-model="form.passwordConfirmation"
        id="passwordConfirmation"
        label="Repite la contraseña"
        type="password"
        autocomplete="new-password"
        :error="fieldErrors.passwordConfirmation?.[0]"
      />
      <button
        type="submit"
        class="min-h-11 w-full rounded-control bg-rail px-4 font-semibold text-on-dark"
        :disabled="isSubmitting"
        :aria-busy="isSubmitting"
      >
        {{ isSubmitting ? 'Creando…' : 'Crear cuenta' }}
      </button>
    </form>
    <p class="mt-5 text-center text-sm text-ink-muted">
      ¿Ya tienes cuenta?
      <RouterLink
        class="font-semibold text-sky-text"
        to="/login"
        >Iniciar sesión</RouterLink
      >
    </p>
  </section>
</template>
