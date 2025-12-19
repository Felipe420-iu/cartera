import { Request, Response } from 'express';
import { AppDataSource } from '../database/config';
import { Client } from '../entities/Client';
import { Repository } from 'typeorm';

export class ClientController {
  private clientRepository: Repository<Client>;

  constructor() {
    this.clientRepository = AppDataSource.getRepository(Client);
  }

  // Obtener todos los clientes
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const clients = await this.clientRepository.find({
        relations: ['loans'],
        order: { createdAt: 'DESC' }
      });
      res.json(clients);
    } catch (error) {
      console.error('Error getting clients:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // Obtener cliente por ID
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const client = await this.clientRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['loans', 'loans.installmentsList']
      });

      if (!client) {
        res.status(404).json({ error: 'Cliente no encontrado' });
        return;
      }

      res.json(client);
    } catch (error) {
      console.error('Error getting client:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // Crear nuevo cliente
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, lastName, documentId, phone, email, address } = req.body;

      // Validar campos requeridos
      if (!name || !lastName || !documentId) {
        res.status(400).json({ error: 'Nombre, apellido y documento son requeridos' });
        return;
      }

      // Verificar que el documento no exista
      const existingClient = await this.clientRepository.findOne({
        where: { documentId }
      });

      if (existingClient) {
        res.status(400).json({ error: 'Ya existe un cliente con este documento' });
        return;
      }

      const client = this.clientRepository.create({
        name,
        lastName,
        documentId,
        phone,
        email,
        address
      });

      const savedClient = await this.clientRepository.save(client);
      res.status(201).json(savedClient);
    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // Actualizar cliente
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, lastName, documentId, phone, email, address } = req.body;

      const client = await this.clientRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!client) {
        res.status(404).json({ error: 'Cliente no encontrado' });
        return;
      }

      // Verificar que el documento no esté en uso por otro cliente
      if (documentId && documentId !== client.documentId) {
        const existingClient = await this.clientRepository.findOne({
          where: { documentId }
        });

        if (existingClient) {
          res.status(400).json({ error: 'Ya existe un cliente con este documento' });
          return;
        }
      }

      // Actualizar campos
      client.name = name || client.name;
      client.lastName = lastName || client.lastName;
      client.documentId = documentId || client.documentId;
      client.phone = phone || client.phone;
      client.email = email || client.email;
      client.address = address || client.address;

      const updatedClient = await this.clientRepository.save(client);
      res.json(updatedClient);
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // Eliminar cliente
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const client = await this.clientRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['loans']
      });

      if (!client) {
        res.status(404).json({ error: 'Cliente no encontrado' });
        return;
      }

      // Verificar que no tenga préstamos activos
      if (client.loans && client.loans.length > 0) {
        res.status(400).json({ error: 'No se puede eliminar un cliente con préstamos registrados' });
        return;
      }

      await this.clientRepository.remove(client);
      res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
}