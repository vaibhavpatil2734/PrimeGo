import { httpClient } from './api';

const CATEGORY_ENDPOINTS = {
  getAll: '/categories',
  getById: (id) => `/categories/${id}`,
  create: '/categories',
  update: (id) => `/categories/${id}`,
  delete: (id) => `/categories/${id}`,
};

const categoryService = {
  // Get all categories
  async getAll(params = {}) {
    try {
      const response = await httpClient.get(CATEGORY_ENDPOINTS.getAll, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch categories',
      };
    }
  },

  // Get category by ID
  async getById(id) {
    try {
      const response = await httpClient.get(CATEGORY_ENDPOINTS.getById(id));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Category not found',
      };
    }
  },

  // Create new category (admin)
  async create(categoryData) {
    try {
      const response = await httpClient.post(CATEGORY_ENDPOINTS.create, categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create category',
      };
    }
  },

  // Update category (admin)
  async update(id, categoryData) {
    try {
      const response = await httpClient.put(CATEGORY_ENDPOINTS.update(id), categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update category',
      };
    }
  },

  // Delete category (admin)
  async delete(id) {
    try {
      await httpClient.delete(CATEGORY_ENDPOINTS.delete(id));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete category',
      };
    }
  },
};

export default categoryService;
