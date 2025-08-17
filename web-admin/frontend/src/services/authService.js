import api from './api';

class AuthService {
  // Login with username and PIN
  async login(username, pin) {
    try {
      const response = await api.post('/auth/login', { username, pin });
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  }

  // Verify token
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Token verification failed' };
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('adminToken');
  }

  // Get current user
  getCurrentUser() {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('adminToken');
  }
}

export default new AuthService();