import { Request, Response } from 'express';
import { AppDataSource } from '../database/config';
import { Loan, LoanStatus } from '../entities/Loan';
import { Installment, InstallmentStatus } from '../entities/Installment';
import { Client } from '../entities/Client';
import { LoanService } from '../services/LoanService';
import { Repository } from 'typeorm';

export class LoanController {
  private loanRepository: Repository<Loan>;
  private installmentRepository: Repository<Installment>;
  private clientRepository: Repository<Client>;
  private loanService: LoanService;

  constructor() {
    this.loanRepository = AppDataSource.getRepository(Loan);
    this.installmentRepository = AppDataSource.getRepository(Installment);
    this.clientRepository = AppDataSource.getRepository(Client);
    this.loanService = new LoanService();
  }

  // Obtener todos los préstamos
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const loans = await this.loanRepository.find({
        relations: ['client', 'installmentsList'],
        order: { createdAt: 'DESC' }
      });
      res.json(loans);
    } catch (error) {
      console.error('Error getting loans:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // Obtener préstamo por ID
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const loan = await this.loanRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['client', 'installmentsList'],
        order: { installmentsList: { installmentNumber: 'ASC' } }
      });

      if (!loan) {
        res.status(404).json({ error: 'Préstamo no encontrado' });
        return;
      }

      res.json(loan);
    } catch (error) {
      console.error('Error getting loan:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // Obtener préstamos por cliente
  getByClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;
      const loans = await this.loanRepository.find({
        where: { clientId: parseInt(clientId) },
        relations: ['client', 'installmentsList'],
        order: { createdAt: 'DESC' }
      });

      res.json(loans);
    } catch (error) {
      console.error('Error getting loans by client:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // Crear nuevo préstamo
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId, amount, interestRate, installments, startDate } = req.body;

      // Validar que el cliente existe
      const client = await this.clientRepository.findOne({
        where: { id: clientId }
      });

      if (!client) {
        res.status(400).json({ error: 'Cliente no encontrado' });
        return;
      }

      // Calcular el préstamo
      const calculation = this.loanService.calculateLoan(
        amount,
        interestRate,
        installments,
        new Date(startDate)
      );

      // Crear el préstamo
      const loan = this.loanRepository.create({
        clientId,
        amount,
        interestRate,
        installments,
        installmentAmount: calculation.installmentAmount,
        totalAmount: calculation.totalAmount,
        startDate: new Date(startDate),
        endDate: calculation.endDate,
        status: LoanStatus.ACTIVE
      });

      const savedLoan = await this.loanRepository.save(loan);

      // Crear las cuotas
      const installmentEntities = calculation.installmentSchedule.map(installmentData => {
        return this.installmentRepository.create({
          loanId: savedLoan.id,
          installmentNumber: installmentData.installmentNumber,
          amount: installmentData.amount,
          overdueInterest: 0,
          totalAmount: installmentData.amount,
          dueDate: new Date(installmentData.dueDate),
          status: InstallmentStatus.PENDING,
          daysOverdue: 0
        });
      });

      await this.installmentRepository.save(installmentEntities);

      // Retornar el préstamo creado con las relaciones
      const createdLoan = await this.loanRepository.findOne({
        where: { id: savedLoan.id },
        relations: ['client', 'installmentsList']
      });

      res.status(201).json(createdLoan);
    } catch (error) {
      console.error('Error creating loan:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // Calcular préstamo (sin crear)
  calculate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { amount, interestRate, installments, startDate } = req.body;

      if (!amount || !interestRate || !installments || !startDate) {
        res.status(400).json({ error: 'Faltan parámetros requeridos' });
        return;
      }

      const calculation = this.loanService.calculateLoan(
        amount,
        interestRate,
        installments,
        new Date(startDate)
      );

      res.json(calculation);
    } catch (error) {
      console.error('Error calculating loan:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // Pagar cuota
  payInstallment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { installmentId } = req.params;
      const { paymentDate } = req.body;

      const installment = await this.installmentRepository.findOne({
        where: { id: parseInt(installmentId) },
        relations: ['loan']
      });

      if (!installment) {
        res.status(404).json({ error: 'Cuota no encontrada' });
        return;
      }

      if (installment.status === InstallmentStatus.PAID) {
        res.status(400).json({ error: 'La cuota ya está pagada' });
        return;
      }

      // Actualizar cuota como pagada
      installment.status = InstallmentStatus.PAID;
      installment.paidDate = paymentDate ? new Date(paymentDate) : new Date();

      await this.installmentRepository.save(installment);

      // Verificar si todas las cuotas están pagadas para actualizar el estado del préstamo
      const allInstallments = await this.installmentRepository.find({
        where: { loanId: installment.loanId }
      });

      const allPaid = allInstallments.every(inst => inst.status === InstallmentStatus.PAID);

      if (allPaid) {
        await this.loanRepository.update(installment.loanId, {
          status: LoanStatus.PAID
        });
      }

      // Retornar la cuota actualizada
      const updatedInstallment = await this.installmentRepository.findOne({
        where: { id: parseInt(installmentId) },
        relations: ['loan', 'loan.client']
      });

      res.json(updatedInstallment);
    } catch (error) {
      console.error('Error paying installment:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
}