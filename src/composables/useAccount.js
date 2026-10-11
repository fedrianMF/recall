import { ref, readonly } from 'vue'

const account = ref('')

function setAccount(value) {
  account.value = value
}

export function useAccount() {
  return { account: readonly(account), setAccount }
}
