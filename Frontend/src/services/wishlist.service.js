import httpClient from './api';

// Get wishlist for a user
export const getWishlist = async (userId) => {
  try {
    const response = await httpClient.get(`/wishlist/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add item to wishlist
export const addToWishlist = async (userId, productId) => {
  try {
    const response = await httpClient.post('/wishlist', {
      userId,
      productId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (userId, productId) => {
  try {
    const response = await httpClient.delete(`/wishlist/${userId}/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check if product is in wishlist
export const checkWishlist = async (userId, productId) => {
  try {
    const response = await httpClient.get(`/wishlist/${userId}/check?productId=${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Clear entire wishlist
export const clearWishlist = async (userId) => {
  try {
    const response = await httpClient.delete(`/wishlist/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist
};

