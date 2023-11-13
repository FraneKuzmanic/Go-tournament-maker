import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/', //ovo doslovno znaci na ruti '/' mi generiraj HomePage komponentu
    name: 'Home',
    component: () => import('src/pages/HomePage.vue'),
  },

  {
    path: '/tournament/:tournamentId/:creatorId?', //creatorId je opcionalni dio rute jer postoje admini i obicni korisnici
    name: 'TournamentPage',
    component: () => import('src/pages/TournamentPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
