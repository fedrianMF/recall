<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useSession } from '../../composables/useSession'
import { useSync } from '../../composables/useSync'
import { syncStatusLabel } from '../../utils/syncStatus'

const { user } = useSession()
const { latest, isRunning, error, start } = useSync()
const disabledReason = computed(() =>
  user.value?.email_verified ? '' : 'Verifica tu correo para sincronizar.',
)
const errorMessage = computed(() =>
  error.value?.code === 'no_accounts_linked'
    ? 'Vincula una cuenta para sincronizar.'
    : error.value?.code === 'email_not_verified'
      ? 'Verifica tu correo para sincronizar.'
      : error.value?.code === 'too_many_requests'
        ? 'Espera un momento antes de volver a sincronizar.'
        : error.value?.message,
)
const dateLabel = computed(() =>
  latest.value?.created_at ? new Date(latest.value.created_at).toLocaleString('es-BO') : '',
)
</script>

<template>
  <div
    class="space-y-2"
    data-focus-theme="dark"
  >
    <button
      type="button"
      class="min-h-11 w-full rounded-control bg-rail px-3 text-left text-sm font-semibold text-on-dark"
      :disabled="isRunning || Boolean(disabledReason)"
      :aria-busy="isRunning"
      @click="start"
    >
      {{ isRunning ? syncStatusLabel(latest?.status) : 'Sincronizar partidas' }}
    </button>
    <p
      v-if="disabledReason"
      class="text-xs text-on-dark-muted"
    >
      {{ disabledReason }}
    </p>
    <p
      v-if="latest && !isRunning"
      class="text-xs text-on-dark-muted"
    >
      Última sincronización: {{ dateLabel }} · {{ latest.new_matches }} partidas nuevas
    </p>
    <p
      v-if="isRunning"
      role="status"
      aria-live="polite"
      class="text-xs text-on-dark-muted"
    >
      {{ syncStatusLabel(latest?.status) }}
    </p>
    <p
      v-if="errorMessage"
      class="text-xs text-danger-fg"
    >
      {{ errorMessage }}
      <RouterLink
        v-if="error?.code === 'no_accounts_linked'"
        to="/accounts"
        class="font-semibold underline"
        >Vincular cuenta</RouterLink
      >
    </p>
  </div>
</template>
