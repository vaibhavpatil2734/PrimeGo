import { httpClient } from './api';
import { getProfile } from './auth.service';
import { v4 as uuidv4 } from 'uuid';

const ORDER_ENDPOINTS = {
  createOrder: '/orders',
  getOrderById: (id) => `/orders/${id}`,
  getUserOrders: (userId) => `/orders/user/${userId}`,
  cancelOrder: (id) => `/orders/${id}/cancel`,
  getAllOrders: '/orders/admin/all',
  updateOrderStatus: (id) => `/orders/admin/${id}/status`,
};

const orderService = {
  // Get current user ID
  async getCurrentUserId() {
    try {
      const userData = await getProfile();
      return userData._id;
    } catch (error) {
      return null;
    }
  },

  // ✅ UPDATED: Create Razorpay order - Send ITEMS only (no total/amount)
  async createPaymentOrder(items, shippingAddressId) {
    try {
      const response = await httpClient.post('/payment/create-order', { 
        items, 
        shippingAddressId 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create payment order',
      };
    }
  },

  // ✅ UPDATED: Verify Razorpay - Forward ALL razorpay response data
  async verifyPayment(razorpayResponse) {
    try {
      const response = await httpClient.post('/payment/verify', razorpayResponse);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Payment verification failed',
      };
    }
  },

  // ✅ UPDATED: COD Orders - Send items only (backend recalculates)
  async createOrderCOD(items, shippingAddressId) {
    try {
      const idempotencyKey = uuidv4(); // Prevent duplicates
      const response = await httpClient.post(ORDER_ENDPOINTS.createOrder, {
        items,
        shippingAddressId,
        payment: { provider: 'cash_on_delivery' },
        idempotencyKey
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create COD order',
      };
    }
  },

  // Get all orders for current user
  async getUserOrders(userId = null) {
    try {
      if (!userId) {
        const currentUserId = await this.getCurrentUserId();
        if (!currentUserId) {
          return { success: false, error: 'User not authenticated' };
        }
        userId = currentUserId;
      }
      const response = await httpClient.get(ORDER_ENDPOINTS.getUserOrders(userId));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch orders',
      };
    }
  },

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const response = await httpClient.get(ORDER_ENDPOINTS.getOrderById(orderId));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Order not found',
      };
    }
  },

  // Cancel order
  async cancelOrder(orderId, reason = '') {
    try {
      const response = await httpClient.patch(ORDER_ENDPOINTS.cancelOrder(orderId), {
        reason,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to cancel order',
      };
    }
  },

  // Admin methods
  async getAllOrders() {
    try {
      const response = await httpClient.get(ORDER_ENDPOINTS.getAllOrders);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch orders',
      };
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const response = await httpClient.patch(ORDER_ENDPOINTS.updateOrderStatus(orderId), { status });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update order status',
      };
    }
  },

  // Format order status for display
  formatStatus(status) {
    const statusMap = {
      'PLACED': { label: 'Order Placed', class: 'warning' },
      'PAID': { label: 'Paid', class: 'info' },
      'SHIPPED': { label: 'Shipped', class: 'primary' },
      'DELIVERED': { label: 'Delivered', class: 'success' },
      'CANCELLED': { label: 'Cancelled', class: 'danger' },
    };
    return statusMap[status] || { label: status, class: 'secondary' };
  },

// Get live Shiprocket tracking for order (enhanced with new fields)
  async getOrderTracking(orderId) {
    try {
      const response = await httpClient.get(`/orders/${orderId}/track`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch tracking',
      };
    }
  },
};

export default orderService;

