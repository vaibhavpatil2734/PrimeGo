import api from './api.js';

const contactService = {
  // Get all contacts (paginated, searchable)
  getAll: async (params = {}) => {
    const response = await api.get('/contacts', { params });
    return response.data;
  },

  // Create new contact
  create: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },

  // Delete contact
  delete: async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },

  // Search contacts (uses backend search param)
  search: async (searchTerm, params = {}) => {
    return contactService.getAll({ ...params, search: searchTerm });
  },

  // Mark contact as read
  markAsRead: async (id) => {
    const response = await api.patch(`/contacts/${id}/read`);
    return response.data;
  }
};

export default contactService;
