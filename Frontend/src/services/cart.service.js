import httpClient from './api';

// Get cart for a user
export const getCart = async () => {
  try {
    const response = await httpClient.get('/cart/');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Add or update item in cart
export const addToCart = async (productId, quantity = 1, customizationType = 'plain', customName = null) => {
  try {
    const response = await httpClient.post('/cart/', {
      productId,
      quantity,
      customizationType,
      customName: customizationType === 'customized' ? customName : undefined
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Remove item from cart (MATCHES CONTROLLER)
export const removeFromCart = async (cartItemId) => {
  try {
    const response = await httpClient.delete(`/cart/${cartItemId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Clear entire cart (MATCHES CONTROLLER)
export const clearCart = async () => {
  try {
    const response = await httpClient.delete('/cart/');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Update cart item (quantity, custom...)
export const updateCartItem = async (cartItemId, updates) => {
  console.log(`🌐 Service: PUT /cart/${cartItemId}`, updates);
  try {
    const response = await httpClient.put(`/cart/${cartItemId}`, updates);
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
  updateCartItem
};

