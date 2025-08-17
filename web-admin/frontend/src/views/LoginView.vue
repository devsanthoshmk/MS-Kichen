<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag class="h-8 w-8 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h2>
        <p class="text-gray-600">
          WhatsApp Food Ordering System
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="username" class="form-label">
              Username
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="form-input pl-10"
                placeholder="Enter username"
                :disabled="loading"
              />
            </div>
          </div>

          <div>
            <label for="pin" class="form-label">
              PIN
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="pin"
                v-model="form.pin"
                type="password"
                required
                class="form-input pl-10"
                placeholder="Enter PIN"
                :disabled="loading"
                maxlength="10"
              />
            </div>
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
            <div class="flex">
              <AlertCircle class="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading || !form.username || !form.pin"
            class="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" class="animate-spin h-5 w-5 mr-2" />
            <LogIn v-else class="h-5 w-5 mr-2" />
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            Default credentials: admin / 12345
          </p>
        </div>
      </div>

      <div class="text-center">
        <p class="text-sm text-gray-500">
          © 2024 Food Ordering Admin Dashboard
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { ShoppingBag, User, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-vue-next';
import authService from '../services/authService';

export default {
  name: 'LoginView',
  components: {
    ShoppingBag,
    User,
    Lock,
    LogIn,
    AlertCircle,
    Loader2
  },
  setup() {
    const router = useRouter();
    const toast = useToast();
    
    const loading = ref(false);
    const error = ref('');
    
    const form = reactive({
      username: '',
      pin: ''
    });

    const handleLogin = async () => {
      if (!form.username || !form.pin) {
        error.value = 'Please enter both username and PIN';
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        const response = await authService.login(form.username, form.pin);
        
        toast.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: response.message || 'Welcome to the admin dashboard!',
          life: 3000
        });

        // Redirect to dashboard
        router.push('/');
      } catch (err) {
        console.error('Login error:', err);
        error.value = err.error || err.message || 'Login failed. Please try again.';
        
        toast.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: error.value,
          life: 5000
        });
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      error,
      handleLogin
    };
  }
};
</script>

<style scoped>
/* Additional component-specific styles if needed */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>