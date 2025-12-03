import axios from 'axios';

// En producción usar la misma URL, en desarrollo usar localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Recurso no encontrado');
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Datos inválidos');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Error del servidor. Intente nuevamente.');
    }
    
    throw new Error(error.response?.data?.error || 'Error de conexión');
  }
);