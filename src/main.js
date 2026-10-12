// The redesign is light only for now. A dark theme will need its own switch and an inline script in index.html.
document.documentElement.dataset.theme = 'light'

async function startApp() {
  try {
    await import('./config/env')

    const [{ createApp }, { default: App }, { default: router }] = await Promise.all([
      import('vue'),
      import('./App.vue'),
      import('./router'),
      import('./assets/main.css'),
    ])

    const app = createApp(App)

    app.use(router)

    app.mount('#app')
  } catch (error) {
    if (error?.name !== 'ConfigError') {
      throw error
    }

    const { showConfigError } = await import('./config/showConfigError')

    showConfigError(error)
  }
}

await startApp()
