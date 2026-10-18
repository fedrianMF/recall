<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, required: true },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: undefined },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="space-y-1.5">
    <label
      :for="id"
      class="block text-sm font-semibold text-ink"
      >{{ label }}</label
    >
    <input
      :id="id"
      :type="type"
      :autocomplete="autocomplete"
      :value="modelValue"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="min-h-11 w-full rounded-control border border-divider bg-surface px-3 text-ink"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <p
      v-if="error"
      :id="`${id}-error`"
      class="text-sm text-danger-fg"
    >
      {{ error }}
    </p>
  </div>
</template>
