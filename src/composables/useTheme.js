import { computed, ref, watch, readonly } from 'vue'

const STORAGE_KEY = 'recall-theme'
const MODES = ['system', 'light', 'dark']

// Browser UI color (<meta name="theme-color">) for each resolved theme
const BROWSER_COLORS = { light: '#dce5d9', dark: '#020618' }

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

function readSavedMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return MODES.includes(saved) ? saved : 'system'
  } catch {
    // Storage can be blocked (private mode, strict settings): fall back to the device theme
    return 'system'
  }
}

function saveMode(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Not saving is fine: the choice just won't survive a reload
  }
}

// Declared outside the function on purpose: every component that calls
// useTheme() shares this same state (same idea as useAccount).
const mode = ref(readSavedMode()) // what the person picked: 'system' | 'light' | 'dark'
const systemIsDark = ref(darkQuery.matches)

// What is actually painted: 'system' is replaced by the device preference
const resolvedTheme = computed(() => {
  if (mode.value === 'system') return systemIsDark.value ? 'dark' : 'light'
  return mode.value
})

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', BROWSER_COLORS[theme])
}

// Call once from main.js, before mounting the app
export function initTheme() {
  // Follows the device live while the mode is 'system'
  darkQuery.addEventListener('change', (event) => {
    systemIsDark.value = event.matches
  })

  watch(resolvedTheme, applyTheme, { immediate: true })
  watch(mode, saveMode)
}

export function useTheme() {
  function setMode(value) {
    if (MODES.includes(value)) mode.value = value
  }

  return { mode: readonly(mode), resolvedTheme, setMode }
}
