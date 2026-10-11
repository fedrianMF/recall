import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// The redesign is light only for now. A dark theme will need its own switch and an inline script in index.html.
document.documentElement.dataset.theme = 'light'

const app = createApp(App)

app.use(router)

app.mount('#app')
