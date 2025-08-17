import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// PrimeVue imports
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

// PrimeVue CSS
import 'primevue/resources/themes/lara-light-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

// Tailwind CSS
import './assets/css/tailwind.css';

// Socket.IO service
import socketService from './services/socketService';

const app = createApp(App);

app.use(router);
app.use(PrimeVue);
app.use(ToastService);

// Initialize Socket.IO connection when user is authenticated
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('adminToken');
  
  if (token && to.path !== '/login') {
    // Connect to Socket.IO if authenticated and not on login page
    if (!socketService.isConnected()) {
      socketService.connect();
    }
  } else if (!token && to.path !== '/login') {
    // Disconnect Socket.IO if not authenticated
    socketService.disconnect();
  }
  
  next();
});

app.mount('#app');