import httpClient from './api';

// Get cart for a user
export const getCart = async (userId) => {
  try {
    const response = await httpClient.get(`/cart/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Add or update item in cart
export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    const response = await httpClient.post(`/cart/${userId}`, {
      productId,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Remove item from cart (MATCHES CONTROLLER)
export const removeFromCart = async (userId, cartItemId) => {
  try {
    const response = await httpClient.delete(`/cart/${userId}/${cartItemId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Clear entire cart (MATCHES CONTROLLER)
export const clearCart = async (userId) => {
  try {
    const response = await httpClient.delete(`/cart/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Update cart item quantity (set absolute quantity) - WITH DEBUG LOGS
export const updateCartQuantity = async (userId, cartItemId, quantity) => {
  console.log(`🌐 Service: PUT /cart/${userId}/${cartItemId} qty=${quantity}`);
  try {
    const response = await httpClient.put(`/cart/${userId}/${cartItemId}`, {
      quantity
    });
    console.log(`✅ Service: Update success, ${response.data.items?.length || 0} items`);
    return response.data;
  } catch (error) {
    console.error('❌ Service: Update failed', error.response?.status, error.response?.data?.message || error.message);
    throw error;
  }
};

export default {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartQuantity
};

