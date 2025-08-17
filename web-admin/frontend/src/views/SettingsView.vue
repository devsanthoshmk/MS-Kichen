<template>
  <Sidebar @refresh="loadSettings">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
        <p class="text-gray-600">Configure your admin dashboard settings</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- System Information -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">System Information</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Application Version</span>
              <span class="text-sm text-gray-900">1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Database Status</span>
              <Badge value="Connected" severity="success" />
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Server Status</span>
              <Badge value="Online" severity="success" />
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Last Updated</span>
              <span class="text-sm text-gray-900">{{ new Date().toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <!-- Admin Profile -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Admin Profile</h3>
          <div class="space-y-4">
            <div>
              <label class="form-label">Username</label>
              <InputText
                v-model="profile.username"
                disabled
                class="w-full"
              />
            </div>
            <div>
              <label class="form-label">Role</label>
              <InputText
                v-model="profile.role"
                disabled
                class="w-full"
              />
            </div>
            <div>
              <label class="form-label">Login Time</label>
              <InputText
                :value="formatDate(profile.loginTime)"
                disabled
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Categories Management -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Categories</h3>
            <Button
              @click="showAddCategoryDialog = true"
              icon="pi pi-plus"
              label="Add Category"
              class="p-button-sm"
            />
          </div>
          
          <div v-if="categories.length === 0" class="text-center py-4">
            <p class="text-gray-500">No categories found</p>
          </div>
          
          <div v-else class="space-y-2">
            <div
              v-for="category in categories"
              :key="category.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900 capitalize">{{ category.name }}</p>
                <p class="text-sm text-gray-500">{{ category.description || 'No description' }}</p>
              </div>
              <Badge
                :value="category.active ? 'Active' : 'Inactive'"
                :severity="category.active ? 'success' : 'secondary'"
              />
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <Button
              @click="exportData"
              icon="pi pi-download"
              label="Export Orders Data"
              class="w-full p-button-outlined"
            />
            <Button
              @click="clearCache"
              icon="pi pi-refresh"
              label="Clear Cache"
              class="w-full p-button-outlined"
            />
            <Button
              @click="testNotifications"
              icon="pi pi-bell"
              label="Test Notifications"
              class="w-full p-button-outlined"
            />
          </div>
        </div>

        <!-- Statistics -->
        <div class="lg:col-span-2">
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">System Statistics</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-primary-600">{{ stats.totalOrders || 0 }}</p>
                <p class="text-sm text-gray-500">Total Orders</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-green-600">{{ stats.totalMenuItems || 0 }}</p>
                <p class="text-sm text-gray-500">Menu Items</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-yellow-600">₹{{ stats.totalRevenue || 0 }}</p>
                <p class="text-sm text-gray-500">Total Revenue</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-purple-600">{{ stats.avgOrderValue || 0 }}</p>
                <p class="text-sm text-gray-500">Avg. Order Value</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Category Dialog -->
    <Dialog
      v-model:visible="showAddCategoryDialog"
      header="Add Category"
      modal
      class="p-fluid"
      style="width: 400px"
    >
      <form @submit.prevent="addCategory" class="space-y-4">
        <div>
          <label class="form-label">Category Name</label>
          <InputText
            v-model="newCategory.name"
            placeholder="Enter category name"
            required
          />
        </div>
        <div>
          <label class="form-label">Description</label>
          <Textarea
            v-model="newCategory.description"
            rows="3"
            placeholder="Enter description (optional)"
          />
        </div>
        <div class="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            @click="closeAddCategoryDialog"
            label="Cancel"
            class="p-button-text"
          />
          <Button
            type="submit"
            label="Add"
            :loading="addingCategory"
            class="p-button-primary"
          />
        </div>
      </form>
    </Dialog>
  </Sidebar>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import Sidebar from '../components/Sidebar.vue';
import authService from '../services/authService';
import menuService from '../services/menuService';
import orderService from '../services/orderService';

export default {
  name: 'SettingsView',
  components: {
    Sidebar,
    Button,
    Badge,
    InputText,
    Textarea,
    Dialog
  },
  setup() {
    const toast = useToast();

    const categories = ref([]);
    const showAddCategoryDialog = ref(false);
    const addingCategory = ref(false);
    
    const profile = reactive({
      username: '',
      role: '',
      loginTime: ''
    });

    const stats = reactive({
      totalOrders: 0,
      totalMenuItems: 0,
      totalRevenue: 0,
      avgOrderValue: 0
    });

    const newCategory = reactive({
      name: '',
      description: ''
    });

    const loadSettings = async () => {
      await Promise.all([
        loadProfile(),
        loadCategories(),
        loadStats()
      ]);
    };

    const loadProfile = () => {
      const user = authService.getCurrentUser();
      if (user) {
        Object.assign(profile, {
          username: user.username || 'admin',
          role: user.role || 'Administrator',
          loginTime: user.loginTime || new Date().toISOString()
        });
      }
    };

    const loadCategories = async () => {
      try {
        const response = await menuService.getCategories();
        categories.value = response;
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    const loadStats = async () => {
      try {
        const [orderStats, menuStats] = await Promise.all([
          orderService.getOrderStats(),
          menuService.getMenuStats()
        ]);

        Object.assign(stats, {
          totalOrders: orderStats.totalOrders || 0,
          totalMenuItems: menuStats.totalItems || 0,
          totalRevenue: orderStats.totalRevenue || 0,
          avgOrderValue: orderStats.totalOrders > 0 
            ? Math.round((orderStats.totalRevenue || 0) / orderStats.totalOrders)
            : 0
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    const addCategory = async () => {
      if (!newCategory.name.trim()) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Category name is required',
          life: 3000
        });
        return;
      }

      addingCategory.value = true;
      try {
        await menuService.createCategory({
          name: newCategory.name.trim(),
          description: newCategory.description.trim()
        });

        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Category added successfully',
          life: 3000
        });

        closeAddCategoryDialog();
        loadCategories();
      } catch (error) {
        console.error('Error adding category:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error || 'Failed to add category',
          life: 3000
        });
      } finally {
        addingCategory.value = false;
      }
    };

    const closeAddCategoryDialog = () => {
      showAddCategoryDialog.value = false;
      Object.assign(newCategory, {
        name: '',
        description: ''
      });
    };

    const exportData = () => {
      toast.add({
        severity: 'info',
        summary: 'Export',
        detail: 'Data export feature coming soon',
        life: 3000
      });
    };

    const clearCache = () => {
      // Clear localStorage except auth token
      const token = localStorage.getItem('adminToken');
      localStorage.clear();
      if (token) {
        localStorage.setItem('adminToken', token);
      }

      toast.add({
        severity: 'success',
        summary: 'Cache Cleared',
        detail: 'Application cache has been cleared',
        life: 3000
      });
    };

    const testNotifications = () => {
      toast.add({
        severity: 'success',
        summary: 'Test Notification',
        detail: 'Notifications are working correctly!',
        life: 3000
      });
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    };

    onMounted(() => {
      loadSettings();
    });

    return {
      categories,
      showAddCategoryDialog,
      addingCategory,
      profile,
      stats,
      newCategory,
      loadSettings,
      addCategory,
      closeAddCategoryDialog,
      exportData,
      clearCache,
      testNotifications,
      formatDate
    };
  }
};
</script>