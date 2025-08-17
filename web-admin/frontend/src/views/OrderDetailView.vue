<template>
  <Sidebar @refresh="loadOrder">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-gray-500">Loading order details...</p>
      </div>
    </div>

    <div v-else-if="!order" class="text-center py-12">
      <ShoppingCart class="mx-auto h-12 w-12 text-gray-400" />
      <p class="mt-2 text-gray-500">Order not found</p>
      <Button
        @click="$router.push('/')"
        label="Back to Dashboard"
        class="p-button-text mt-4"
      />
    </div>

    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center space-x-4">
            <Button
              @click="$router.back()"
              icon="pi pi-arrow-left"
              class="p-button-text p-button-sm"
              title="Go back"
            />
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Order #{{ order.id }}</h1>
              <p class="text-gray-600">{{ formatDate(order.created_at) }}</p>
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <Badge
            :value="order.status"
            :severity="getStatusSeverity(order.status)"
            class="text-sm px-3 py-1"
          />
          <Dropdown
            :model-value="order.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            class="w-40"
            @change="updateOrderStatus($event.value)"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Order Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Customer Information -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-500">Name</label>
                <p class="mt-1 text-sm text-gray-900">{{ order.customer_name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500">Phone</label>
                <p class="mt-1 text-sm text-gray-900">{{ order.phone_number }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-500">Address</label>
                <p class="mt-1 text-sm text-gray-900">{{ order.address }}</p>
              </div>
              <div v-if="order.notes" class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-500">Notes</label>
                <p class="mt-1 text-sm text-gray-900">{{ order.notes }}</p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div class="space-y-3">
              <div
                v-for="(item, index) in order.order_items"
                :key="index"
                class="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
              >
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-900">{{ item.item }}</h4>
                  <p class="text-sm text-gray-500 capitalize">{{ item.category }}</p>
                </div>
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-500">Qty: {{ item.quantity || 1 }}</span>
                  <span class="text-sm font-medium text-gray-900">₹{{ item.price || 0 }}</span>
                  <span class="text-sm font-medium text-gray-900">
                    ₹{{ (item.price || 0) * (item.quantity || 1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="space-y-6">
          <!-- Status Timeline -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
            <div class="space-y-3">
              <div
                v-for="status in statusTimeline"
                :key="status.value"
                class="flex items-center space-x-3"
              >
                <div
                  class="flex-shrink-0 w-3 h-3 rounded-full"
                  :class="[
                    isStatusCompleted(status.value)
                      ? 'bg-green-500'
                      : status.value === order.status
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  ]"
                ></div>
                <div class="flex-1">
                  <p
                    class="text-sm font-medium"
                    :class="[
                      isStatusCompleted(status.value) || status.value === order.status
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    ]"
                  >
                    {{ status.label }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Subtotal</span>
                <span class="text-gray-900">₹{{ calculateSubtotal() }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Tax</span>
                <span class="text-gray-900">₹0</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Delivery</span>
                <span class="text-gray-900">₹0</span>
              </div>
              <div class="border-t border-gray-200 pt-2">
                <div class="flex justify-between">
                  <span class="text-base font-medium text-gray-900">Total</span>
                  <span class="text-base font-medium text-gray-900">₹{{ order.total_amount }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div class="space-y-3">
              <Button
                @click="printOrder"
                icon="pi pi-print"
                label="Print Order"
                class="w-full p-button-outlined"
              />
              <Button
                @click="deleteOrder"
                icon="pi pi-trash"
                label="Delete Order"
                class="w-full p-button-danger p-button-outlined"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Dropdown from 'primevue/dropdown';
import { ShoppingCart } from 'lucide-vue-next';
import Sidebar from '../components/Sidebar.vue';
import orderService from '../services/orderService';

export default {
  name: 'OrderDetailView',
  components: {
    Sidebar,
    Button,
    Badge,
    Dropdown,
    ShoppingCart
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    const loading = ref(false);
    const order = ref(null);

    const statusOptions = computed(() => orderService.getStatusOptions());

    const statusTimeline = [
      { label: 'Pending', value: 'pending' },
      { label: 'Confirmed', value: 'confirmed' },
      { label: 'Preparing', value: 'preparing' },
      { label: 'Ready', value: 'ready' },
      { label: 'Delivered', value: 'delivered' }
    ];

    const loadOrder = async () => {
      loading.value = true;
      try {
        const orderId = route.params.id;
        const response = await orderService.getOrder(orderId);
        order.value = response;
      } catch (error) {
        console.error('Error loading order:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load order details',
          life: 3000
        });
      } finally {
        loading.value = false;
      }
    };

    const updateOrderStatus = async (newStatus) => {
      try {
        await orderService.updateOrderStatus(order.value.id, newStatus);
        order.value.status = newStatus;
        
        toast.add({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Order status updated to ${newStatus}`,
          life: 3000
        });
      } catch (error) {
        console.error('Error updating order status:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update order status',
          life: 3000
        });
      }
    };

    const deleteOrder = async () => {
      if (!confirm('Are you sure you want to delete this order?')) {
        return;
      }

      try {
        await orderService.deleteOrder(order.value.id);
        
        toast.add({
          severity: 'success',
          summary: 'Order Deleted',
          detail: 'Order has been deleted successfully',
          life: 3000
        });

        router.push('/');
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete order',
          life: 3000
        });
      }
    };

    const printOrder = () => {
      window.print();
    };

    const getStatusSeverity = (status) => {
      const statusMap = {
        pending: 'warning',
        confirmed: 'info',
        preparing: 'warning',
        ready: 'success',
        delivered: 'success',
        cancelled: 'danger'
      };
      return statusMap[status] || 'secondary';
    };

    const isStatusCompleted = (status) => {
      if (!order.value) return false;
      
      const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
      const currentIndex = statusOrder.indexOf(order.value.status);
      const checkIndex = statusOrder.indexOf(status);
      
      return checkIndex < currentIndex || (checkIndex === currentIndex && order.value.status !== 'cancelled');
    };

    const calculateSubtotal = () => {
      if (!order.value?.order_items) return 0;
      return order.value.order_items.reduce((sum, item) => {
        return sum + ((item.price || 0) * (item.quantity || 1));
      }, 0);
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString();
    };

    onMounted(() => {
      loadOrder();
    });

    return {
      loading,
      order,
      statusOptions,
      statusTimeline,
      loadOrder,
      updateOrderStatus,
      deleteOrder,
      printOrder,
      getStatusSeverity,
      isStatusCompleted,
      calculateSubtotal,
      formatDate
    };
  }
};
</script>

<style scoped>
@media print {
  .p-button,
  .p-dropdown {
    display: none !important;
  }
}
</style>