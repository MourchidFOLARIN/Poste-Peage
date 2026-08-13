import axios from 'axios';

// URL de l'API REST Render, Variable d'environnement ou Fallback Relatif
const BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (typeof window !== 'undefined' ? window.location.origin : '');

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
