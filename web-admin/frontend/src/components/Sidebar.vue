<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="flex flex-col w-64 bg-white shadow-lg">
      <!-- Logo/Header -->
      <div class="flex items-center justify-center h-16 px-4 bg-primary-600 text-white">
        <ShoppingBag class="h-8 w-8 mr-3" />
        <h1 class="text-lg font-bold">Food Admin</h1>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.path"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200"
          :class="[
            $route.path === item.path
              ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          ]"
        >
          <component :is="item.icon" class="h-5 w-5 mr-3" />
          {{ item.name }}
          <span
            v-if="item.badge"
            class="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </nav>

      <!-- User Info & Logout -->
      <div class="px-4 py-4 border-t border-gray-200">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
              <User class="h-6 w-6 text-white" />
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ currentUser?.username || 'Admin' }}</p>
            <p class="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        
        <button
          @click="handleLogout"
          class="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
        >
          <LogOut class="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between px-6 py-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ pageTitle }}</h2>
            <p class="text-sm text-gray-500">{{ pageDescription }}</p>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <button
              class="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full"
            >
              <Bell class="h-6 w-6" />
              <span
                v-if="notificationCount > 0"
                class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
              >
                {{ notificationCount > 9 ? '9+' : notificationCount }}
              </span>
            </button>

            <!-- Refresh Button -->
            <button
              @click="$emit('refresh')"
              class="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full"
              title="Refresh"
            >
              <RefreshCw class="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import {
  ShoppingBag,
  LayoutDashboard,
  Menu,
  ShoppingCart,
  Settings,
  User,
  LogOut,
  Bell,
  RefreshCw
} from 'lucide-vue-next';
import authService from '../services/authService';

export default {
  name: 'Sidebar',
  components: {
    ShoppingBag,
    LayoutDashboard,
    Menu,
    ShoppingCart,
    Settings,
    User,
    LogOut,
    Bell,
    RefreshCw
  },
  emits: ['refresh'],
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();

    const notificationCount = ref(0);

    const navigationItems = [
      {
        name: 'Dashboard',
        path: '/',
        icon: LayoutDashboard
      },
      {
        name: 'Menu Management',
        path: '/menu',
        icon: Menu
      },
      {
        name: 'Settings',
        path: '/settings',
        icon: Settings
      }
    ];

    const currentUser = computed(() => {
      return authService.getCurrentUser();
    });

    const pageTitle = computed(() => {
      const currentRoute = navigationItems.find(item => item.path === route.path);
      return currentRoute?.name || 'Dashboard';
    });

    const pageDescription = computed(() => {
      switch (route.path) {
        case '/':
          return 'Monitor orders and track performance';
        case '/menu':
          return 'Manage menu items and categories';
        case '/settings':
          return 'Configure system settings';
        default:
          return 'Admin dashboard';
      }
    });

    const handleLogout = async () => {
      try {
        authService.logout();
        
        toast.add({
          severity: 'success',
          summary: 'Logged Out',
          detail: 'You have been successfully logged out',
          life: 3000
        });

        router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
        toast.add({
          severity: 'error',
          summary: 'Logout Error',
          detail: 'An error occurred during logout',
          life: 3000
        });
      }
    };

    return {
      navigationItems,
      currentUser,
      pageTitle,
      pageDescription,
      notificationCount,
      handleLogout
    };
  }
};
</script>

<style scoped>
/* Custom scrollbar for main content */
main::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track {
  background: #f1f1f1;
}

main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

main::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>