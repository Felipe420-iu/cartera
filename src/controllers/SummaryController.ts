import { Request, Response } from 'express';
import { AppDataSource } from '../database/config';
import { Loan, LoanStatus } from '../entities/Loan';
import { Installment, InstallmentStatus } from '../entities/Installment';
import { Client } from '../entities/Client';
import { Repository } from 'typeorm';

export class SummaryController {
  private loanRepository: Repository<Loan>;
  private installmentRepository: Repository<Installment>;
  private clientRepository: Repository<Client>;

  constructor() {
    this.loanRepository = AppDataSource.getRepository(Loan);
    this.installmentRepository = AppDataSource.getRepository(Installment);
    this.clientRepository = AppDataSource.getRepository(Client);
  }

  // Obtener resumen general
  getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtener todos los préstamos con sus cuotas
      const loans = await this.loanRepository.find({
        relations: ['installmentsList', 'client']
      });

      // Obtener todas las cuotas
      const installments = await this.installmentRepository.find({
        relations: ['loan', 'loan.client']
      });

      // Calcular totales
      let totalLent = 0;
      let totalWithInterest = 0;
      let totalReceived = 0;
      let totalPending = 0;
      let totalOverdue = 0;
      let totalInterestEarned = 0;
      let activeLoansCount = 0;
      let overdueInstallments = 0;
      let upcomingInstallments = 0;

      // Procesar préstamos
      loans.forEach(loan => {
        totalLent += Number(loan.amount);
        totalWithInterest += Number(loan.totalAmount);
        
        if (loan.status === LoanStatus.ACTIVE) {
          activeLoansCount++;
        }
      });

      // Fecha actual y próximos 7 días
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      // Procesar cuotas
      installments.forEach(installment => {
        const dueDate = new Date(installment.dueDate);
        
        if (installment.status === InstallmentStatus.PAID) {
          totalReceived += Number(installment.totalAmount);
        } else if (installment.status === InstallmentStatus.OVERDUE) {
          totalOverdue += Number(installment.totalAmount);
          overdueInstallments++;
        } else if (installment.status === InstallmentStatus.PENDING) {
          totalPending += Number(installment.totalAmount);
          
          // Verificar si está vencida
          if (dueDate < today) {
            totalOverdue += Number(installment.totalAmount);
            overdueInstallments++;
          }
          // Verificar si vence en los próximos 7 días
          else if (dueDate <= nextWeek) {
            upcomingInstallments++;
          }
        }
      });

      // Calcular intereses ganados
      totalInterestEarned = totalReceived - (totalLent * (totalReceived / totalWithInterest || 0));

      // Obtener próximos pagos
      const upcomingPayments = await this.installmentRepository
        .createQueryBuilder('installment')
        .leftJoinAndSelect('installment.loan', 'loan')
        .leftJoinAndSelect('loan.client', 'client')
        .where('installment.status = :status', { status: InstallmentStatus.PENDING })
        .andWhere('installment.dueDate >= :today', { today })
        .andWhere('installment.dueDate <= :nextWeek', { nextWeek })
        .orderBy('installment.dueDate', 'ASC')
        .limit(10)
        .getMany();

      const formattedUpcomingPayments = upcomingPayments.map(installment => ({
        id: installment.id,
        installmentNumber: installment.installmentNumber,
        amount: Number(installment.totalAmount),
        dueDate: installment.dueDate,
        clientName: `${installment.loan.client.name} ${installment.loan.client.lastName}`,
        loanId: installment.loanId
      }));

      const summary = {
        totalLent: Number(totalLent.toFixed(2)),
        totalWithInterest: Number(totalWithInterest.toFixed(2)),
        totalReceived: Number(totalReceived.toFixed(2)),
        totalPending: Number(totalPending.toFixed(2)),
        totalOverdue: Number(totalOverdue.toFixed(2)),
        totalInterestEarned: Number(totalInterestEarned.toFixed(2)),
        activeLoansCount,
        overdueInstallments,
        upcomingInstallments,
        upcomingPayments: formattedUpcomingPayments
      };

      res.json(summary);
    } catch (error) {
      console.error('Error getting summary:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // Obtener datos del calendario
  getCalendarData = async (req: Request, res: Response): Promise<void> => {
    try {
      const installments = await this.installmentRepository.find({
        relations: ['loan', 'loan.client'],
        where: { status: InstallmentStatus.PENDING }
      });

      const calendarEvents = installments.map(installment => ({
        id: installment.id,
        title: `${installment.loan?.client?.name || 'Cliente'} - Cuota #${installment.installmentNumber}`,
        start: installment.dueDate,
        amount: Number(installment.totalAmount),
        status: installment.status,
        clientName: installment.loan?.client ? 
          `${installment.loan.client.name} ${installment.loan.client.lastName}` : 
          'Cliente desconocido',
        loanId: installment.loanId,
        installmentNumber: installment.installmentNumber,
        backgroundColor: this.getEventColor(installment.dueDate, installment.status),
        borderColor: this.getEventColor(installment.dueDate, installment.status)
      }));

      res.json(calendarEvents);
    } catch (error) {
      console.error('Error getting calendar data:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  private getEventColor(dueDate: Date, status: string): string {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    if (status === InstallmentStatus.OVERDUE || dueDate < today) {
      return '#ef4444'; // Rojo - Vencido
    } else if (dueDate <= nextWeek) {
      return '#f59e0b'; // Amarillo - Próximo a vencer
    } else {
      return '#3b82f6'; // Azul - Normal
    }
  }
}