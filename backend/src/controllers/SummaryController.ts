import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Loan, LoanStatus } from '../entities/Loan';
import { Installment, InstallmentStatus } from '../entities/Installment';
import { Repository } from 'typeorm';

export class SummaryController {
  private loanRepository: Repository<Loan>;
  private installmentRepository: Repository<Installment>;

  constructor() {
    this.loanRepository = AppDataSource.getRepository(Loan);
    this.installmentRepository = AppDataSource.getRepository(Installment);
  }

  // Obtener resumen general del dinero
  getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtener todos los préstamos activos
      const activeLoans = await this.loanRepository.find({
        where: { status: LoanStatus.ACTIVE },
        relations: ['installmentsList']
      });

      // Obtener todas las cuotas
      const allInstallments = await this.installmentRepository.find({
        relations: ['loan']
      });

      // Calcular totales
      const totalLent = activeLoans.reduce((sum, loan) => sum + Number(loan.amount), 0);
      const totalWithInterest = activeLoans.reduce((sum, loan) => sum + Number(loan.totalAmount), 0);
      
      const paidInstallments = allInstallments.filter(inst => inst.status === InstallmentStatus.PAID);
      const totalReceived = paidInstallments.reduce((sum, inst) => sum + Number(inst.totalAmount), 0);
      
      const pendingInstallments = allInstallments.filter(inst => 
        inst.status === InstallmentStatus.PENDING && 
        inst.loan.status === LoanStatus.ACTIVE
      );
      const totalPending = pendingInstallments.reduce((sum, inst) => sum + Number(inst.totalAmount), 0);
      
      const overdueInstallments = allInstallments.filter(inst => inst.status === InstallmentStatus.OVERDUE);
      const totalOverdue = overdueInstallments.reduce((sum, inst) => sum + Number(inst.totalAmount), 0);

      // Calcular intereses ganados
      const totalInterestEarned = totalReceived - activeLoans
        .filter(loan => paidInstallments.some(inst => inst.loanId === loan.id))
        .reduce((sum, loan) => {
          const loanPaidAmount = paidInstallments
            .filter(inst => inst.loanId === loan.id)
            .reduce((loanSum, inst) => loanSum + Number(inst.amount), 0);
          
          const proportionPaid = loanPaidAmount / Number(loan.amount);
          return sum + (Number(loan.amount) * proportionPaid);
        }, 0);

      // Obtener próximos vencimientos (próximos 7 días)
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const upcomingInstallments = pendingInstallments.filter(inst => {
        const dueDate = new Date(inst.dueDate);
        return dueDate >= today && dueDate <= nextWeek;
      });

      const summary = {
        totalAvailable: 0, // Este valor debería venir de una configuración o balance inicial
        totalLent,
        totalWithInterest,
        totalReceived,
        totalPending,
        totalOverdue,
        totalInterestEarned,
        activeLoansCount: activeLoans.length,
        upcomingInstallments: upcomingInstallments.length,
        overdueInstallments: overdueInstallments.length,
        upcomingPayments: upcomingInstallments.map(inst => ({
          id: inst.id,
          clientName: inst.loan?.client?.name + ' ' + inst.loan?.client?.lastName,
          amount: inst.totalAmount,
          dueDate: inst.dueDate,
          installmentNumber: inst.installmentNumber
        }))
      };

      res.json(summary);
    } catch (error) {
      console.error('Error getting summary:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // Obtener calendario de pagos
  getCalendarData = async (req: Request, res: Response): Promise<void> => {
    try {
      const installments = await this.installmentRepository.find({
        relations: ['loan', 'loan.client'],
        where: {
          loan: {
            status: LoanStatus.ACTIVE
          }
        }
      });

      const calendarEvents = installments.map(inst => {
        let color = '#3b82f6'; // azul para pendiente
        if (inst.status === InstallmentStatus.PAID) color = '#10b981'; // verde para pagado
        if (inst.status === InstallmentStatus.OVERDUE) color = '#ef4444'; // rojo para vencido

        return {
          id: inst.id.toString(),
          title: `${inst.loan.client.name} ${inst.loan.client.lastName} - $${inst.totalAmount}`,
          start: inst.dueDate,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            clientId: inst.loan.clientId,
            clientName: `${inst.loan.client.name} ${inst.loan.client.lastName}`,
            loanId: inst.loan.id,
            installmentNumber: inst.installmentNumber,
            amount: inst.totalAmount,
            status: inst.status,
            overdueInterest: inst.overdueInterest
          }
        };
      });

      res.json(calendarEvents);
    } catch (error) {
      console.error('Error getting calendar data:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
}