import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
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
        relations: ['loans', 'loans.installmentsList']
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

      // Validar que el documento no exista
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

      // Validar documento único si se está cambiando
      if (documentId && documentId !== client.documentId) {
        const existingClient = await this.clientRepository.findOne({
          where: { documentId }
        });

        if (existingClient) {
          res.status(400).json({ error: 'Ya existe un cliente con este documento' });
          return;
        }
      }

      await this.clientRepository.update(parseInt(id), {
        name,
        lastName,
        documentId,
        phone,
        email,
        address
      });

      const updatedClient = await this.clientRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['loans', 'loans.installmentsList']
      });

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
      const activeLoans = client.loans?.filter(loan => loan.status === 'active') || [];
      if (activeLoans.length > 0) {
        res.status(400).json({ error: 'No se puede eliminar un cliente con préstamos activos' });
        return;
      }

      await this.clientRepository.remove(client);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
}