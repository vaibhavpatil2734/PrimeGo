import httpClient from './api';

// Get user profile
export const getProfile = async () => {
  const response = await httpClient.get('/user/profile');
  return response.data;
};

// Update user profile
export const updateProfile = async (data) => {
  const response = await httpClient.put('/user/profile', data);
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = '/login';
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Get user role
export const getUserRole = () => {
  return localStorage.getItem('role');
};
