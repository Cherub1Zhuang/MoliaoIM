import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@renderer/stores/user'
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@renderer/views/home.vue'),
    redirect: '/chats',
    children: [
      {
        path: 'chats',
        component: () => import('@renderer/views/home/chats.vue'),
        children: [
          {
            path: '',
            name: 'chats-default',
            component: () => import('@renderer/views/home/chats/default.vue')
          },
          {
            path: 'conversation/:target',
            name: 'chats-conversation',
            component: () => import('@renderer/views/home/chats/conversation.vue')
          }
        ]
      },
      {
        path: 'friends',
        name: 'friends',
        component: () => import('@renderer/views/home/friends.vue'),
        children: [
          {
            path: '',
            name: 'friends-default',
            component: () => import('@renderer/views/home/chats/default.vue')
          },
          {
            path: 'info/:id',
            name: 'friend-info',
            component: () => import('@renderer/views/home/friends/info.vue')
          }
        ]
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
