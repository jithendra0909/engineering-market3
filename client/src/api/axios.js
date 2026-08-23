import axios from 'axios';

// Production/Development API URL configuration:
// 1. If VITE_API_URL is set (e.g. deployed backend URL on Render/Vercel), use it.
// 2. In production without VITE_API_URL, use relative '/api' path.
// 3. In development, use local backend on 'http://localhost:5000/api'.
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  return import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
};

const baseURL = getBaseURL();

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
