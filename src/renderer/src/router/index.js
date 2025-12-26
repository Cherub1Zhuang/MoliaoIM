import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@renderer/stores/user'
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@renderer/views/home.vue'),
    children: [
      {
        path: '',
        component: () => import('@renderer/views/home/conversation.vue')
      }
    ],
    meta: { requireLogin: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@renderer/views/login.vue')
  }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requireLogin && !userStore.is_login) {
    next({ name: 'login' })
  } else {
    next()
  }
})
export default router
