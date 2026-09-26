import { ref } from 'vue'

const account = ref('')

export function useAccount() {
  return { account }
}
