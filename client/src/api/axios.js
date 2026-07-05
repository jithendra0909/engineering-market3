import axios from 'axios';

// In production (Vercel), client and API are on the same domain → use relative path
// In development, proxy to localhost:5000
const baseURL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('em_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
