import { createRouter, createWebHistory } from 'vue-router'
import ChampionsView from '../views/ChampionsView.vue'
import MatchDetailView from '../views/MatchDetailView.vue'
import MatchesView from '../views/MatchesView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import NewHomeView from '@/views/NewHomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import { useSession } from '../composables/useSession'
import EmailVerifiedView from '../views/EmailVerifiedView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'summary',
      component: NewHomeView,
      meta: { title: 'Resumen', needsAccounts: true },
    },
    // Old address of the redesigned summary, kept so existing bookmarks still work.
    {
      path: '/new-home',
      redirect: { name: 'summary' },
    },
    {
      path: '/champions',
      name: 'champions',
      component: ChampionsView,
      meta: { title: 'Campeones', needsAccounts: true },
    },
    {
      path: '/matches',
      name: 'matches',
      component: MatchesView,
      meta: { title: 'Historial', needsAccounts: true },
    },
    {
      path: '/matches/:id',
      name: 'match-detail',
      component: MatchDetailView,
      meta: { title: 'Partida', needsAccounts: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Iniciar sesión', public: true, guestOnly: true, layout: 'auth' },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { title: 'Crear cuenta', public: true, guestOnly: true, layout: 'auth' },
    },
    {
      path: '/email-verified',
      name: 'email-verified',
      component: EmailVerifiedView,
      meta: { title: 'Correo verificado', public: true, layout: 'auth' },
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import('../views/AccountsView.vue'),
      meta: { title: 'Cuentas' },
    },
    {
      path: '/404',
      name: 'not-found',
      component: NotFoundView,
      meta: { title: 'Página no encontrada', public: true },
    },
    // Must stay last: `:pathMatch(.*)*` matches any path no route above claimed,
    // and sends it to the 404 page. It redirects by path, not by name: a redirect by
    // name carries over the `pathMatch` param, which `/404` does not declare, and
    // Vue Router warns about it.
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

let restored = false
router.beforeEach(async (to) => {
  const session = useSession()
  if (!restored) {
    restored = true
    await session.restore()
  }

  if (!to.meta.public && !session.isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && session.isAuthenticated.value) {
    return '/'
  }
})

// Runs after every navigation: sets the tab title from the route's meta.title
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Recall` : 'Recall'
})

export default router
