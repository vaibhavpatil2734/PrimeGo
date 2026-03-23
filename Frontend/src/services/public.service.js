import axios from 'axios';

const PUBLIC_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const publicHttpClient = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// No auth interceptor - public only
export default publicHttpClient;

