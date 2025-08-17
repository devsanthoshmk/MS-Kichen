import api from './api';

class MenuService {
  // Get all menu items with pagination and filtering
  async getMenuItems(params = {}) {
    try {
      const response = await api.get('/menu', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch menu items' };
    }
  }

  // Get menu items grouped by category
  async getGroupedMenu() {
    try {
      const response = await api.get('/menu/grouped');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch grouped menu' };
    }
  }

  // Get single menu item by ID
  async getMenuItem(id) {
    try {
      const response = await api.get(`/menu/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch menu item' };
    }
  }

  // Create new menu item
  async createMenuItem(menuItemData) {
    try {
      const formData = new FormData();
      Object.keys(menuItemData).forEach(key => {
        if (menuItemData[key] !== null && menuItemData[key] !== undefined) {
          formData.append(key, menuItemData[key]);
        }
      });

      const response = await api.post('/menu', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create menu item' };
    }
  }

  // Update menu item
  async updateMenuItem(id, menuItemData) {
    try {
      const formData = new FormData();
      Object.keys(menuItemData).forEach(key => {
        if (menuItemData[key] !== null && menuItemData[key] !== undefined) {
          formData.append(key, menuItemData[key]);
        }
      });

      const response = await api.put(`/menu/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update menu item' };
    }
  }

  // Toggle menu item availability
  async toggleAvailability(id) {
    try {
      const response = await api.put(`/menu/${id}/toggle-availability`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to toggle availability' };
    }
  }

  // Delete menu item
  async deleteMenuItem(id) {
    try {
      const response = await api.delete(`/menu/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete menu item' };
    }
  }

  // Get categories
  async getCategories() {
    try {
      const response = await api.get('/menu/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch categories' };
    }
  }

  // Create new category
  async createCategory(categoryData) {
    try {
      const response = await api.post('/menu/categories', categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create category' };
    }
  }

  // Get menu statistics
  async getMenuStats() {
    try {
      const response = await api.get('/menu/stats/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch menu statistics' };
    }
  }
}

export default new MenuService();