import { httpClient } from './api';

const ADMIN_ENDPOINTS = {
  getStats: '/admin/stats',
  getProductStatus: '/admin/product-status',
  getOrderStatus: '/admin/order-status',
  getSystemStatus: '/admin/system-status',
  getAllUsers: '/admin/users',
  getUser: (id) => `/admin/users/${id}`,
  updateUserRole: (id) => `/admin/users/${id}/role`,
  deleteUser: (id) => `/admin/users/${id}`,
};

const adminService = {
  // Get dashboard statistics
  async getStats() {
    try {
      const response = await httpClient.get(ADMIN_ENDPOINTS.getStats);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch stats',
      };
    }
  },

  // Get product status statistics
  async getProductStatus() {
    try {
      const response = await httpClient.get(ADMIN_ENDPOINTS.getProductStatus);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch product status',
      };
    }
  },

  // Get order status statistics
  async getOrderStatus() {
    try {
      const response = await httpClient.get(ADMIN_ENDPOINTS.getOrderStatus);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch order status',
      };
    }
  },

  // Get system status (MongoDB, Cloudinary)
  async getSystemStatus() {
    try {
      const response = await httpClient.get(ADMIN_ENDPOINTS.getSystemStatus);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch system status',
      };
    }
  },

  // Get all users
  async getAllUsers() {
    try {
      const response = await httpClient.get(ADMIN_ENDPOINTS.getAllUsers);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch users',
      };
    }
  },

  // Get user by ID
  async getUser(id) {
    try {
      const response = await httpClient.get(ADMIN_ENDPOINTS.getUser(id));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user',
      };
    }
  },

  // Update user role
  async updateUserRole(id, role) {
    try {
      const response = await httpClient.put(ADMIN_ENDPOINTS.updateUserRole(id), { role });
      const data = response.data;
      
      // If new token provided (role change), update localStorage
      if (data.newToken) {
        localStorage.setItem('token', data.newToken);
        localStorage.setItem('role', data.user.role);
      }
      
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user role',
      };
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      const response = await httpClient.delete(ADMIN_ENDPOINTS.deleteUser(id));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete user',
      };
    }
  },

  // Get site contact information
  async getContactInfo() {
    try {
      const response = await httpClient.get('/contact-info');
      console.log('[admin.service.js] GET /contact-info response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[admin.service.js] GET /contact-info error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch contact info',
      };
    }
  },

  // Update site contact information
  async updateContactInfo(data) {
    console.log('[admin.service.js] PATCH /contact-info data:', data);
    try {
      const response = await httpClient.patch('/contact-info', data);
      console.log('[admin.service.js] PATCH /contact-info success:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[admin.service.js] PATCH /contact-info error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update contact info',
      };
    }
  }
};

export default adminService;
