import { createMemoryHistory, createRouter } from 'vue-router'

// An in-memory router: it keeps the "current URL" in a JS variable instead of
// the browser address bar, so <RouterLink> works inside tests without a real browser.
// The routes only need to exist for the links of the shell (see navItems.js).
export async function createTestRouter() {
  const Stub = { render: () => null }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/champions', component: Stub },
      { path: '/matches', component: Stub },
    ],
  })

  await router.push('/')
  await router.isReady()

  return router
}
