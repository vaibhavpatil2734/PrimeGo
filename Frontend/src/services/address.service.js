import httpClient from './api';

// Get all addresses for a user
export const getAddresses = async (userId) => {
  const response = await httpClient.get(`/addresses/user/${userId}`);
  return response.data;
};

// Add a new address
export const addAddress = async (addressData) => {
  const response = await httpClient.post('/addresses', addressData);
  return response.data;
};

// Update an address
export const updateAddress = async (id, addressData) => {
  const response = await httpClient.put(`/addresses/${id}`, addressData);
  return response.data;
};

// Delete an address
export const deleteAddress = async (id) => {
  const response = await httpClient.delete(`/addresses/${id}`);
  return response.data;
};

// Set default address
export const setDefaultAddress = async (id) => {
  const response = await httpClient.patch(`/addresses/${id}/default`);
  return response.data;
};
