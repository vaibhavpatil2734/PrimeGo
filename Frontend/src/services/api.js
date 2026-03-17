import axios from 'axios';

import BASE_URL from '../config/api.js';
const API_BASE_URL = `${BASE_URL}/api`;

// Track loading count globally (outside React context to avoid circular dependencies)
let loadingCount = 0;
const listeners = new Set();

// Simple pub/sub for loading state
export const subscribeToLoading = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notifyLoading = (isLoading) => {
  listeners.forEach(callback => callback(isLoading));
};

const startLoading = () => {
  loadingCount++;
  notifyLoading(true);
};

const stopLoading = () => {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) {
    notifyLoading(false);
  }
};

// Create axios instance with default config
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Start loading for this request
    startLoading();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
httpClient.interceptors.response.use(
  (response) => {
    // Stop loading for this request
    stopLoading();
    return response;
  },
  (error) => {
    // Stop loading for this request
    stopLoading();
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { httpClient };
export default httpClient;
