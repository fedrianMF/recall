import { createRouter, createWebHistory } from 'vue-router'
import ChampionsView from '../views/ChampionsView.vue'
import MatchDetailView from '../views/MatchDetailView.vue'
import MatchesView from '../views/MatchesView.vue'
import SummaryView from '../views/SummaryView.vue'
import NewHomeView from '@/views/NewHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/new-home',
      name: 'new-home',
      component: NewHomeView,
      meta: { layout: 'redesign' },
    },
    {
      path: '/',
      name: 'summary',
      component: SummaryView,
    },
    {
      path: '/champions',
      name: 'champions',
      component: ChampionsView,
    },
    {
      path: '/matches',
      name: 'matches',
      component: MatchesView,
    },
    {
      path: '/matches/:id',
      name: 'match-detail',
      component: MatchDetailView,
    },
  ],
})

export default router
