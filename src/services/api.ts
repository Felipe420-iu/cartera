import axios from 'axios';

const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ?? window.location.origin;
const normalizedBase = apiBase.replace(/\/$/, '');

export const api = axios.create({
  baseURL: `${normalizedBase}/api`,
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