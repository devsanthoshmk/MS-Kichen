<template>
  <Sidebar @refresh="refreshData">
    <div class="space-y-6">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart class="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Orders</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalOrders || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp class="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Today's Orders</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.todayOrders || 0 }}</p>
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
              <p class="text-sm font-medium text-gray-500">Today's Revenue</p>
              <p class="text-2xl font-bold text-gray-900">₹{{ stats.todayRevenue || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock class="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pending Orders</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.ordersByStatus?.pending || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Section -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">Recent Orders</h3>
          <div class="flex items-center space-x-4">
            <!-- Status Filter -->
            <Dropdown
              v-model="selectedStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by status"
              class="w-48"
              @change="loadOrders"
            />
            
            <!-- Refresh Button -->
            <Button
              @click="refreshData"
              :loading="loading"
              icon="pi pi-refresh"
              class="p-button-outlined p-button-sm"
              title="Refresh orders"
            />
          </div>
        </div>

        <!-- Orders List -->
        <div v-if="loading && orders.length === 0" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-500">Loading orders...</p>
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-8">
          <ShoppingCart class="mx-auto h-12 w-12 text-gray-400" />
          <p class="mt-2 text-gray-500">No orders found</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="order in orders"
            :key="order.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            @click="viewOrderDetails(order.id)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-4">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">
                      Order #{{ order.id }}
                    </h4>
                    <p class="text-sm text-gray-500">{{ order.customer_name }}</p>
                  </div>
                  
                  <div class="hidden sm:block">
                    <p class="text-sm text-gray-900">{{ order.phone_number }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(order.created_at) }}</p>
                  </div>
                </div>

                <div class="mt-2">
                  <p class="text-sm text-gray-600 line-clamp-2">
                    {{ getOrderItemsText(order.order_items) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">₹{{ order.total_amount }}</p>
                  <Badge
                    :value="order.status"
                    :severity="getStatusSeverity(order.status)"
                    class="text-xs"
                  />
                </div>

                <div class="flex items-center space-x-2">
                  <Dropdown
                    :model-value="order.status"
                    :options="statusOptions"
                    option-label="label"
                    option-value="value"
                    class="w-32"
                    @change="updateOrderStatus(order.id, $event.value)"
                    @click.stop
                  />
                  
                  <Button
                    @click.stop="deleteOrder(order.id)"
                    icon="pi pi-trash"
                    class="p-button-danger p-button-text p-button-sm"
                    title="Delete order"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="mt-6 flex justify-center">
          <Paginator
            :rows="pagination.limit"
            :total-records="pagination.total"
            :first="(pagination.page - 1) * pagination.limit"
            @page="onPageChange"
          />
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Paginator from 'primevue/paginator';
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Clock,
  Eye
} from 'lucide-vue-next';
import Sidebar from '../components/Sidebar.vue';
import orderService from '../services/orderService';

export default {
  name: 'DashboardView',
  components: {
    Sidebar,
    Dropdown,
    Button,
    Badge,
    Paginator,
    ShoppingCart,
    TrendingUp,
    DollarSign,
    Clock,
    Eye
  },
  setup() {
    const router = useRouter();
    const toast = useToast();

    const loading = ref(false);
    const orders = ref([]);
    const stats = reactive({});
    const selectedStatus = ref('all');
    
    const pagination = reactive({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    });

    const statusOptions = computed(() => [
      { label: 'All Orders', value: 'all' },
      ...orderService.getStatusOptions()
    ]);

    const loadOrders = async () => {
      loading.value = true;
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          status: selectedStatus.value === 'all' ? undefined : selectedStatus.value
        };

        const response = await orderService.getOrders(params);
        orders.value = response.orders;
        Object.assign(pagination, response.pagination);
      } catch (error) {
        console.error('Error loading orders:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load orders',
          life: 3000
        });
      } finally {
        loading.value = false;
      }
    };

    const loadStats = async () => {
      try {
        const response = await orderService.getOrderStats();
        Object.assign(stats, response);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    const refreshData = async () => {
      await Promise.all([loadOrders(), loadStats()]);
    };

    const updateOrderStatus = async (orderId, newStatus) => {
      try {
        await orderService.updateOrderStatus(orderId, newStatus);
        
        // Update local order status
        const order = orders.value.find(o => o.id === orderId);
        if (order) {
          order.status = newStatus;
        }

        toast.add({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Order status updated to ${newStatus}`,
          life: 3000
        });

        // Refresh stats
        loadStats();
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

    const deleteOrder = async (orderId) => {
      if (!confirm('Are you sure you want to delete this order?')) {
        return;
      }

      try {
        await orderService.deleteOrder(orderId);
        
        // Remove from local list
        orders.value = orders.value.filter(o => o.id !== orderId);
        
        toast.add({
          severity: 'success',
          summary: 'Order Deleted',
          detail: 'Order has been deleted successfully',
          life: 3000
        });

        // Refresh stats
        loadStats();
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

    const viewOrderDetails = (orderId) => {
      router.push(`/orders/${orderId}`);
    };

    const onPageChange = (event) => {
      pagination.page = Math.floor(event.first / event.rows) + 1;
      loadOrders();
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

    const getOrderItemsText = (items) => {
      if (!Array.isArray(items)) return '';
      return items.map(item => `${item.item} (${item.quantity || 1})`).join(', ');
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString();
    };

    onMounted(() => {
      refreshData();
    });

    return {
      loading,
      orders,
      stats,
      selectedStatus,
      pagination,
      statusOptions,
      loadOrders,
      refreshData,
      updateOrderStatus,
      deleteOrder,
      viewOrderDetails,
      onPageChange,
      getStatusSeverity,
      getOrderItemsText,
      formatDate
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