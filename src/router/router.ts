import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Authenticate',
    component: () => import('../views/Authenticate.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
