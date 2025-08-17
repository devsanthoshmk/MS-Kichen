import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import MenuView from '../views/MenuView.vue';
import OrderDetailView from '../views/OrderDetailView.vue';
import SettingsView from '../views/SettingsView.vue';

// Authentication guard
function requireAuth(to, from, next) {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    next('/login');
  } else {
    next();
  }
}

// Guest guard (redirect to dashboard if already logged in)
function requireGuest(to, from, next) {
  const token = localStorage.getItem('adminToken');
  if (token) {
    next('/');
  } else {
    next();
  }
}

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    beforeEnter: requireAuth
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    beforeEnter: requireGuest
  },
  {
    path: '/menu',
    name: 'Menu',
    component: MenuView,
    beforeEnter: requireAuth
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetailView,
    beforeEnter: requireAuth,
    props: true
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    beforeEnter: requireAuth
  },
  // Catch all routes
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;