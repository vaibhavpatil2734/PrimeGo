import { httpClient } from './api';
import { getProfile } from './auth.service';

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
      console.error("Error getting user:", error);
      return null;
    }
  },

  // Get all orders for current user
  async getUserOrders(userId) {
    try {
      const response = await httpClient.get(ORDER_ENDPOINTS.getUserOrders(userId));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch orders',
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
        error: error.response?.data?.message || 'Order not found',
      };
    }
  },

  // Create new order
  async createOrder(orderData) {
    try {
      const response = await httpClient.post(ORDER_ENDPOINTS.createOrder, orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create order',
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
        error: error.response?.data?.message || 'Failed to cancel order',
      };
    }
  },

  // Get all orders (Admin)
  async getAllOrders() {
    try {
      const response = await httpClient.get(ORDER_ENDPOINTS.getAllOrders);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch orders',
      };
    }
  },

  // Update order status (Admin)
  async updateOrderStatus(orderId, status) {
    try {
      const response = await httpClient.patch(ORDER_ENDPOINTS.updateOrderStatus(orderId), { status });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update order status',
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

  // Calculate order totals
  calculateOrderTotals(items, shipping = 0, taxRate = 0.1) {
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const tax = Number((subtotal * taxRate).toFixed(2));
    const total = subtotal + tax + shipping;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax,
      shipping,
      total: Number(total.toFixed(2)),
    };
  },

  // Create Razorpay order (for payment integration)
  async createRazorpayOrder(amount) {
    // This would typically call your backend to create a Razorpay order
    // For now, we'll simulate the Razorpay integration
    return {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
    };
  }
};

export default orderService;
