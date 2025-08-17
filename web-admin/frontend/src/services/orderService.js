import api from './api';

class OrderService {
  // Get all orders with pagination and filtering
  async getOrders(params = {}) {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch orders' };
    }
  }

  // Get single order by ID
  async getOrder(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch order' };
    }
  }

  // Update order
  async updateOrder(id, orderData) {
    try {
      const response = await api.put(`/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update order' };
    }
  }

  // Update order status
  async updateOrderStatus(id, status) {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update order status' };
    }
  }

  // Delete order
  async deleteOrder(id) {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete order' };
    }
  }

  // Get order statistics
  async getOrderStats() {
    try {
      const response = await api.get('/orders/stats/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch order statistics' };
    }
  }

  // Get order status options
  getStatusOptions() {
    return [
      { label: 'Pending', value: 'pending', color: 'orange' },
      { label: 'Confirmed', value: 'confirmed', color: 'blue' },
      { label: 'Preparing', value: 'preparing', color: 'yellow' },
      { label: 'Ready', value: 'ready', color: 'green' },
      { label: 'Delivered', value: 'delivered', color: 'teal' },
      { label: 'Cancelled', value: 'cancelled', color: 'red' }
    ];
  }

  // Get status color
  getStatusColor(status) {
    const statusOption = this.getStatusOptions().find(option => option.value === status);
    return statusOption ? statusOption.color : 'gray';
  }
}

export default new OrderService();