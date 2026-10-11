import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// The redesign is light only for now: useTheme.js is kept for a future dark theme.
document.documentElement.dataset.theme = 'light'

const app = createApp(App)

app.use(router)

app.mount('#app')
