import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
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