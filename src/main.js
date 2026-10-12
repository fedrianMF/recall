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
