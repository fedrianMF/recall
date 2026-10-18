<script setup>
import { reactive, ref } from 'vue'
import { linkAccount } from '../../api/recall'

const emit = defineEmits(['linked'])
const form = reactive({ gameName: '', tagLine: '', platform: 'la1' })
const error = ref(null)
const success = ref('')
const isSubmitting = ref(false)

function fieldError(field) {
  return error.value?.errors?.[field]?.[0]
}
function messageFor(requestError) {
  const messages = {
    riot_account_not_found: 'No encontramos ese Riot ID en esa plataforma.',
    account_limit_reached: 'Alcanzaste el límite de cuentas vinculadas.',
    account_already_linked: 'Esa cuenta ya está vinculada a otro usuario.',
    email_not_verified: 'Verifica tu correo para vincular cuentas.',
    riot_key_expired: 'Riot no está disponible por ahora. Inténtalo más tarde.',
  }
  return (
    messages[requestError.code] ??
    (requestError.status === 422 ? '' : 'No se pudo vincular la cuenta. Inténtalo de nuevo.')
  )
}

async function submit() {
  error.value = null
  success.value = ''
  isSubmitting.value = true
  try {
    const result = await linkAccount({
      gameName: form.gameName.trim(),
      tagLine: form.tagLine.trim().replace(/^#/, ''),
      platform: form.platform,
    })
    emit('linked', result.data)
    success.value = 'Cuenta vinculada'
    form.gameName = ''
    form.tagLine = ''
  } catch (requestError) {
    error.value = requestError
    error.value.message = messageFor(requestError)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form
    class="space-y-4 rounded-2xl bg-surface p-5 shadow-card"
    @submit.prevent="submit"
  >
    <h2 class="font-display text-xl font-bold text-ink">Vincular cuenta</h2>
    <p
      v-if="success"
      role="status"
      class="text-sm text-win-text"
    >
      {{ success }}
    </p>
    <p
      v-if="error?.message"
      role="alert"
      class="text-sm text-danger-fg"
    >
      {{ error.message }}
    </p>
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="text-sm font-semibold"
        >Riot ID<input
          v-model="form.gameName"
          maxlength="32"
          required
          class="mt-1 min-h-11 w-full rounded-control border border-divider px-3 font-normal"
        /><span
          v-if="fieldError('game_name')"
          class="text-xs text-danger-fg"
          >{{ fieldError('game_name') }}</span
        ></label
      >
      <label class="text-sm font-semibold"
        >Tag Line<input
          v-model="form.tagLine"
          maxlength="10"
          required
          class="mt-1 min-h-11 w-full rounded-control border border-divider px-3 font-normal"
        /><span
          v-if="fieldError('tag_line')"
          class="text-xs text-danger-fg"
          >{{ fieldError('tag_line') }}</span
        ></label
      >
    </div>
    <label class="block text-sm font-semibold"
      >Plataforma<select
        v-model="form.platform"
        class="mt-1 min-h-11 w-full rounded-control border border-divider bg-surface px-3"
      >
        <option value="la1">LAN</option>
        <option value="la2">LAS</option>
      </select></label
    >
    <button
      type="submit"
      class="min-h-11 rounded-control bg-rail px-5 font-semibold text-on-dark"
      :disabled="isSubmitting"
    >
      {{ isSubmitting ? 'Vinculando…' : 'Vincular cuenta' }}
    </button>
  </form>
</template>
