import { httpClient } from './api';

const PRODUCT_ENDPOINTS = {
  getAll: '/products',
  getById: (id) => `/products/${id}`,
  getByCategory: (category) => `/products/category/${category}`,
  search: '/products/search',
  featured: '/products/featured',
  create: '/products',
  update: (id) => `/products/${id}`,
  delete: (id) => `/products/${id}`,
  getReviews: (productId) => `/products/${productId}/reviews`,
  addReview: (productId) => `/products/${productId}/reviews`,
};

const productService = {
  // Get all products
  async getAll(params = {}) {
    try {
      const response = await httpClient.get(PRODUCT_ENDPOINTS.getAll, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products',
      };
    }
  },

  // Get product by ID
  async getById(id) {
    try {
      const response = await httpClient.get(PRODUCT_ENDPOINTS.getById(id));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Product not found',
      };
    }
  },

  // Get products by category
  async getByCategory(category, params = {}) {
    try {
      const response = await httpClient.get(
        PRODUCT_ENDPOINTS.getByCategory(category),
        { params }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products',
      };
    }
  },

  // Search products
  async search(query, params = {}) {
    try {
      const response = await httpClient.get(PRODUCT_ENDPOINTS.search, {
        params: { q: query, ...params },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Search failed',
      };
    }
  },

  // Get featured products
  async getFeatured(limit = 10) {
    try {
      const response = await httpClient.get(PRODUCT_ENDPOINTS.featured, {
        params: { limit },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch featured products',
      };
    }
  },

  // Create new product (admin)
  async create(productData) {
    try {
      const response = await httpClient.post(PRODUCT_ENDPOINTS.create, productData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create product',
      };
    }
  },

  // Update product (admin)
  async update(id, productData) {
    try {
      const response = await httpClient.put(
        PRODUCT_ENDPOINTS.update(id),
        productData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update product',
      };
    }
  },

  // Delete product (admin)
  async delete(id) {
    try {
      await httpClient.delete(PRODUCT_ENDPOINTS.delete(id));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete product',
      };
    }
  },

  // Upload product images (admin)
  async uploadImages(productId, formData) {
    try {
      const response = await httpClient.post(
        `/products/${productId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload images',
      };
    }
  },

  // Get product reviews
  async getReviews(productId, params = {}) {
    try {
      const response = await httpClient.get(
        PRODUCT_ENDPOINTS.getReviews(productId),
        { params }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch reviews',
      };
    }
  },

  // Add product review
  async addReview(productId, reviewData) {
    try {
      const response = await httpClient.post(
        PRODUCT_ENDPOINTS.addReview(productId),
        reviewData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add review',
      };
    }
  },
};

export default productService;
