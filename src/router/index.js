import { createRouter, createWebHistory } from 'vue-router'
import ChampionsView from '../views/ChampionsView.vue'
import MatchDetailView from '../views/MatchDetailView.vue'
import MatchesView from '../views/MatchesView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import SummaryView from '../views/SummaryView.vue'
import NewHomeView from '@/views/NewHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/new-home',
      name: 'new-home',
      component: NewHomeView,
      meta: { layout: 'redesign', title: 'Nuevo inicio' },
    },
    {
      path: '/',
      name: 'summary',
      component: SummaryView,
      meta: { title: 'Resumen' },
    },
    {
      path: '/champions',
      name: 'champions',
      component: ChampionsView,
      meta: { title: 'Campeones' },
    },
    {
      path: '/matches',
      name: 'matches',
      component: MatchesView,
      meta: { title: 'Historial' },
    },
    {
      path: '/matches/:id',
      name: 'match-detail',
      component: MatchDetailView,
      meta: { title: 'Partida' },
    },
    {
      path: '/404',
      name: 'not-found',
      component: NotFoundView,
      meta: { title: 'Página no encontrada' },
    },
    // Must stay last: `:pathMatch(.*)*` matches any path no route above claimed,
    // and sends it to the 404 page.
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'not-found' },
    },
  ],
})

// Runs after every navigation: sets the tab title from the route's meta.title
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Recall` : 'Recall'
})

export default router
