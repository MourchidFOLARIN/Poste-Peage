import axios from 'axios';

// URL de l'API REST Render ou Fallback Local
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour joindre le token d'authentification si disponible
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('peage_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
