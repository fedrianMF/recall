<script setup>
import { ref } from 'vue'
import { resendVerificationEmail } from '../../api/recall'
import { useSession } from '../../composables/useSession'

const { user, refreshUser } = useSession()
const message = ref('')
const isSending = ref(false)
async function resend() {
  isSending.value = true
  message.value = ''
  try {
    await resendVerificationEmail()
    message.value = 'Te enviamos un correo nuevo.'
  } catch (error) {
    if (error.status === 409) await refreshUser()
    else if (error.status === 429) message.value = 'Espera un momento antes de volver a intentarlo.'
    else message.value = 'No se pudo reenviar el correo. Inténtalo de nuevo.'
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div
    v-if="user && !user.email_verified"
    role="status"
    class="mb-6 flex flex-wrap items-center gap-3 rounded-control bg-gold-soft px-4 py-3 text-sm text-gold-text"
  >
    <span>Verifica tu correo para vincular cuentas y sincronizar.</span>
    <button
      type="button"
      class="min-h-11 rounded-control bg-rail px-3 font-semibold text-on-dark"
      :disabled="isSending"
      @click="resend"
    >
      {{ isSending ? 'Enviando…' : 'Reenviar correo' }}
    </button>
    <span v-if="message">{{ message }}</span>
  </div>
</template>
