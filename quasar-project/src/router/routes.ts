import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('src/pages/HomePage.vue'),
  },

  {
    path: '/tournament/:tournamentId/:creatorId?',
    name: 'tournamentDetail',
    component: () => import('src/pages/TournamentDetail.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
