<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  champion: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    default: null,
  },
})

const imageFailed = ref(false)

const imageUrl = computed(() => {
  if (!props.version) {
    return null
  }

  const championName = encodeURIComponent(props.champion)

  return `https://ddragon.leagueoflegends.com/cdn/${props.version}/img/champion/${championName}.png`
})

const initial = computed(() => props.champion.trim().charAt(0).toUpperCase() || '?')

watch([() => props.champion, () => props.version], () => {
  imageFailed.value = false
})
</script>

<template>
  <img
    v-if="imageUrl && !imageFailed"
    :src="imageUrl"
    :alt="champion"
    class="size-10 rounded-lg object-cover"
    loading="lazy"
    @error="imageFailed = true"
  />
  <span
    v-else
    class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-950 font-semibold text-cyan-300"
    aria-hidden="true"
  >
    {{ initial }}
  </span>
</template>
