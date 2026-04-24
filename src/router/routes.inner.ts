import type { RouteRecordRaw } from 'vue-router'

/* 页面中的一些固定路由，错误页等 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    meta: { title: '' },
    children: [
    ],
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/not-found',
    name: 'not-found',
    component: () => import('@/views/build-in/not-found/index.vue'),
    meta: {
      title: '找不到页面',
      withoutTab: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/build-in/not-found/index.vue'),
    name: 'not-found',
    meta: {
      title: '找不到页面',
      withoutTab: true,
    },
  },
]