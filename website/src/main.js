import { createApp } from 'vue'
import App from './App.vue'

// PrimeVue imports
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css'



const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});

app.mount('#app');