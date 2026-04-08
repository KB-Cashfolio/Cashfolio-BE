import { createRouter, createWebHistory } from 'vue-router';
import TransactionsView from '../views/TransactionsView.vue';

const routes = [
  {
    path: '/',
    name: 'transactions',
    component: TransactionsView,
  },
];

const router = createRouter({
  // Vite 환경에서는 import.meta.env를 사용합니다.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
