import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 1. Check if user is logged in
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// 2. Fetch User Profile
export const getProfile = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_BASE_URL}/api/user/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// 3. Update User Profile
export const updateProfile = async (userData) => {
  const token = localStorage.getItem('token');
  const res = await axios.put(`${API_BASE_URL}/api/user/profile`, userData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// 4. Logout Function
export const logout = () => {
  localStorage.clear(); 
  window.location.href = "/login"; 
};

// 5. Fetch User Addresses (Required for your Profile.jsx)
export const getAddresses = async (userId) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_BASE_URL}/api/addresses/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// 6. Standard Login
export const login = async (credentials) => {
  const res = await axios.post(`${API_BASE_URL}/api/user/login`, credentials);
  return res.data;
};

// 7. Standard Register
export const register = async (userData) => {
  const res = await axios.post(`${API_BASE_URL}/api/user/register`, userData);
  return res.data;
};


export const getUserRole = () => {
  return localStorage.getItem('role'); 
};