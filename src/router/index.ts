import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory((import.meta as any).env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('../views/index.vue')
    },
    {
      path: '/cubing',
      name: 'cubing',
      component: () => import('../views/cubing.vue')
    },
    {
      path: '/chating',
      name: 'chating',
      component: () => import('../views/chating.vue')
    },
  ]
})

export default router
