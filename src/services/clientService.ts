import { api } from './api';
import { Client, CreateClientRequest, UpdateClientRequest } from '../types';

export const clientService = {
  // Obtener todos los clientes
  async getAll(): Promise<Client[]> {
    const response = await api.get('/api/clients');
    return response.data;
  },

  // Obtener cliente por ID
  async getById(id: number): Promise<Client> {
    const response = await api.get(`/api/clients/${id}`);
    return response.data;
  },

  // Crear nuevo cliente
  async create(client: CreateClientRequest): Promise<Client> {
    const response = await api.post('/api/clients', client);
    return response.data;
  },

  // Actualizar cliente
  async update(id: number, client: UpdateClientRequest): Promise<Client> {
    const response = await api.put(`/api/clients/${id}`, client);
    return response.data;
  },

  // Eliminar cliente
  async delete(id: number): Promise<void> {
    await api.delete(`/api/clients/${id}`);
  }
};