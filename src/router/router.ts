import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  // {
  //   path: '/contactUs',
  //   name: 'ContactUs',
  //   component: () => import('../components/ContactUs'),
  // },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
  },
  {
    path: '/',
    name: 'Authenticate',
    component: () => import('../views/Authenticate.vue'),
  },
  {
    path: '/database',
    name: 'Database',
    component: () => import('../views/Database.vue'),
  },
  // {
  //   path: '/profile',
  //   name: 'ProfilePage',
  //   component: () => import('../components/ProfilePage'),
  // },
  // {
  //   path: '/aplDetails/:id',
  //   name: 'AplDetails',
  //   component: () => import('../components/AplDetails'),
  //   props: true,
  // },
  // {
  //   path: '/aplslist',
  //   name: 'AplsList',
  //   component: () => import('../components/AplsList'),
  // },
  // {
  //   path: '/requests',
  //   name: 'AdminRequests',
  //   component: () => import('../components/AdminRequests'),
  // },
  // {
  //   path: '/userreport/:id',
  //   name: 'UserReport',
  //   component: () => import('../components/UserReport'),
  //   ops: true,
  // },
  // {
  //   path: '/viewRequest',
  //   name: 'ViewRequest',
  //   mponent: () => import('../components/ViewRequest'),
  // },
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: () => import('../views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
