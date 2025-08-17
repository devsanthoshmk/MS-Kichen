<template>
  <Sidebar @refresh="refreshData">
    <div class="space-y-6">
      <!-- Header with Add Button -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p class="text-gray-600">Manage your restaurant menu items and categories</p>
        </div>
        <Button
          @click="showAddDialog = true"
          icon="pi pi-plus"
          label="Add Menu Item"
          class="p-button-primary"
        />
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Menu class="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalItems || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle class="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Available</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.availableItems || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign class="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Avg. Price</p>
              <p class="text-2xl font-bold text-gray-900">₹{{ stats.averagePrice || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu Items Table -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">Menu Items</h3>
          <div class="flex items-center space-x-4">
            <!-- Category Filter -->
            <Dropdown
              v-model="selectedCategory"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by category"
              class="w-48"
              @change="loadMenuItems"
            />
            
            <!-- Availability Filter -->
            <Dropdown
              v-model="selectedAvailability"
              :options="availabilityOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by availability"
              class="w-48"
              @change="loadMenuItems"
            />
          </div>
        </div>

        <DataTable
          :value="menuItems"
          :loading="loading"
          paginator
          :rows="10"
          :total-records="pagination.total"
          lazy
          @page="onPageChange"
          responsive-layout="scroll"
          class="p-datatable-sm"
        >
          <Column field="image_url" header="Image" style="width: 80px">
            <template #body="{ data }">
              <img
                v-if="data.image_url"
                :src="data.image_url"
                :alt="data.name"
                class="h-12 w-12 object-cover rounded-lg"
              />
              <div
                v-else
                class="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center"
              >
                <ImageIcon class="h-6 w-6 text-gray-400" />
              </div>
            </template>
          </Column>

          <Column field="name" header="Name" sortable>
            <template #body="{ data }">
              <div>
                <p class="font-medium text-gray-900">{{ data.name }}</p>
                <p class="text-sm text-gray-500 capitalize">{{ data.category }}</p>
              </div>
            </template>
          </Column>

          <Column field="description" header="Description">
            <template #body="{ data }">
              <p class="text-sm text-gray-600 line-clamp-2">
                {{ data.description || 'No description' }}
              </p>
            </template>
          </Column>

          <Column field="price" header="Price" sortable>
            <template #body="{ data }">
              <span class="font-medium">₹{{ data.price }}</span>
            </template>
          </Column>

          <Column field="available" header="Status">
            <template #body="{ data }">
              <Badge
                :value="data.available ? 'Available' : 'Unavailable'"
                :severity="data.available ? 'success' : 'danger'"
              />
            </template>
          </Column>

          <Column header="Actions" style="width: 150px">
            <template #body="{ data }">
              <div class="flex items-center space-x-2">
                <Button
                  @click="editMenuItem(data)"
                  icon="pi pi-pencil"
                  class="p-button-text p-button-sm"
                  title="Edit"
                />
                <Button
                  @click="toggleAvailability(data.id)"
                  :icon="data.available ? 'pi pi-eye-slash' : 'pi pi-eye'"
                  :class="data.available ? 'p-button-warning' : 'p-button-success'"
                  class="p-button-text p-button-sm"
                  :title="data.available ? 'Disable' : 'Enable'"
                />
                <Button
                  @click="deleteMenuItem(data.id)"
                  icon="pi pi-trash"
                  class="p-button-danger p-button-text p-button-sm"
                  title="Delete"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <Dialog
      v-model:visible="showAddDialog"
      :header="editingItem ? 'Edit Menu Item' : 'Add Menu Item'"
      modal
      class="p-fluid"
      style="width: 500px"
    >
      <form @submit.prevent="saveMenuItem" class="space-y-4">
        <div>
          <label class="form-label">Category</label>
          <Dropdown
            v-model="form.category"
            :options="categories"
            option-label="name"
            option-value="name"
            placeholder="Select category"
            class="w-full"
            required
          />
        </div>

        <div>
          <label class="form-label">Name</label>
          <InputText
            v-model="form.name"
            placeholder="Enter item name"
            required
          />
        </div>

        <div>
          <label class="form-label">Price (₹)</label>
          <InputNumber
            v-model="form.price"
            mode="currency"
            currency="INR"
            locale="en-IN"
            :min="0"
            required
          />
        </div>

        <div>
          <label class="form-label">Description</label>
          <Textarea
            v-model="form.description"
            rows="3"
            placeholder="Enter description (optional)"
          />
        </div>

        <div>
          <label class="form-label">Image</label>
          <FileUpload
            mode="basic"
            accept="image/*"
            :max-file-size="5000000"
            @select="onImageSelect"
            :auto="false"
            choose-label="Choose Image"
          />
        </div>

        <div class="flex items-center">
          <Checkbox
            v-model="form.available"
            input-id="available"
            binary
          />
          <label for="available" class="ml-2">Available for ordering</label>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            @click="closeDialog"
            label="Cancel"
            class="p-button-text"
          />
          <Button
            type="submit"
            :label="editingItem ? 'Update' : 'Add'"
            :loading="saving"
            class="p-button-primary"
          />
        </div>
      </form>
    </Dialog>
  </Sidebar>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import Checkbox from 'primevue/checkbox';
import {
  Menu,
  CheckCircle,
  DollarSign,
  Image as ImageIcon
} from 'lucide-vue-next';
import Sidebar from '../components/Sidebar.vue';
import menuService from '../services/menuService';

export default {
  name: 'MenuView',
  components: {
    Sidebar,
    DataTable,
    Column,
    Button,
    Badge,
    Dialog,
    Dropdown,
    InputText,
    InputNumber,
    Textarea,
    FileUpload,
    Checkbox,
    Menu,
    CheckCircle,
    DollarSign,
    ImageIcon
  },
  setup() {
    const toast = useToast();

    const loading = ref(false);
    const saving = ref(false);
    const menuItems = ref([]);
    const categories = ref([]);
    const stats = reactive({});
    const showAddDialog = ref(false);
    const editingItem = ref(null);
    const selectedCategory = ref('all');
    const selectedAvailability = ref('all');

    const pagination = reactive({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    });

    const form = reactive({
      category: '',
      name: '',
      price: 0,
      description: '',
      available: true,
      image: null
    });

    const categoryOptions = computed(() => [
      { label: 'All Categories', value: 'all' },
      ...categories.value.map(cat => ({ label: cat.name, value: cat.name }))
    ]);

    const availabilityOptions = [
      { label: 'All Items', value: 'all' },
      { label: 'Available', value: 'true' },
      { label: 'Unavailable', value: 'false' }
    ];

    const loadMenuItems = async () => {
      loading.value = true;
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          category: selectedCategory.value === 'all' ? undefined : selectedCategory.value,
          available: selectedAvailability.value === 'all' ? undefined : selectedAvailability.value
        };

        const response = await menuService.getMenuItems(params);
        menuItems.value = response.menuItems;
        Object.assign(pagination, response.pagination);
      } catch (error) {
        console.error('Error loading menu items:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load menu items',
          life: 3000
        });
      } finally {
        loading.value = false;
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
        const response = await menuService.getMenuStats();
        Object.assign(stats, response);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    const refreshData = async () => {
      await Promise.all([loadMenuItems(), loadCategories(), loadStats()]);
    };

    const editMenuItem = (item) => {
      editingItem.value = item;
      Object.assign(form, {
        category: item.category,
        name: item.name,
        price: item.price,
        description: item.description || '',
        available: !!item.available,
        image: null
      });
      showAddDialog.value = true;
    };

    const saveMenuItem = async () => {
      saving.value = true;
      try {
        const formData = {
          category: form.category,
          name: form.name,
          price: form.price,
          description: form.description,
          available: form.available
        };

        if (form.image) {
          formData.image = form.image;
        }

        if (editingItem.value) {
          await menuService.updateMenuItem(editingItem.value.id, formData);
          toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Menu item updated successfully',
            life: 3000
          });
        } else {
          await menuService.createMenuItem(formData);
          toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Menu item added successfully',
            life: 3000
          });
        }

        closeDialog();
        refreshData();
      } catch (error) {
        console.error('Error saving menu item:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error || 'Failed to save menu item',
          life: 3000
        });
      } finally {
        saving.value = false;
      }
    };

    const toggleAvailability = async (itemId) => {
      try {
        await menuService.toggleAvailability(itemId);
        
        // Update local item
        const item = menuItems.value.find(i => i.id === itemId);
        if (item) {
          item.available = !item.available;
        }

        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Item availability updated',
          life: 3000
        });

        loadStats();
      } catch (error) {
        console.error('Error toggling availability:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update availability',
          life: 3000
        });
      }
    };

    const deleteMenuItem = async (itemId) => {
      if (!confirm('Are you sure you want to delete this menu item?')) {
        return;
      }

      try {
        await menuService.deleteMenuItem(itemId);
        
        // Remove from local list
        menuItems.value = menuItems.value.filter(i => i.id !== itemId);
        
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Menu item deleted successfully',
          life: 3000
        });

        loadStats();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete menu item',
          life: 3000
        });
      }
    };

    const onImageSelect = (event) => {
      form.image = event.files[0];
    };

    const onPageChange = (event) => {
      pagination.page = Math.floor(event.first / event.rows) + 1;
      loadMenuItems();
    };

    const closeDialog = () => {
      showAddDialog.value = false;
      editingItem.value = null;
      Object.assign(form, {
        category: '',
        name: '',
        price: 0,
        description: '',
        available: true,
        image: null
      });
    };

    onMounted(() => {
      refreshData();
    });

    return {
      loading,
      saving,
      menuItems,
      categories,
      stats,
      showAddDialog,
      editingItem,
      selectedCategory,
      selectedAvailability,
      pagination,
      form,
      categoryOptions,
      availabilityOptions,
      loadMenuItems,
      refreshData,
      editMenuItem,
      saveMenuItem,
      toggleAvailability,
      deleteMenuItem,
      onImageSelect,
      onPageChange,
      closeDialog
    };
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>