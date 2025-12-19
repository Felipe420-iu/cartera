import * as cron from 'node-cron';
import { AppDataSource } from '../database/config';
import { Installment, InstallmentStatus } from '../entities/Installment';
import { LoanService } from '../services/LoanService';
import { Repository } from 'typeorm';

export class OverdueJob {
  private installmentRepository: Repository<Installment>;
  private loanService: LoanService;

  constructor() {
    this.installmentRepository = AppDataSource.getRepository(Installment);
    this.loanService = new LoanService();
  }

  start() {
    // Ejecutar todos los días a las 6:00 AM
    cron.schedule('0 6 * * *', async () => {
      console.log('⏰ Ejecutando trabajo de cuotas vencidas...');
      await this.processOverdueInstallments();
    });

    console.log('⏰ Cron job de cuotas vencidas iniciado - se ejecutará diariamente a las 6:00 AM');
  }

  async processOverdueInstallments() {
    try {
      const today = new Date();
      
      // Obtener todas las cuotas pendientes
      const pendingInstallments = await this.installmentRepository.find({
        where: { status: InstallmentStatus.PENDING }
      });

      let processedCount = 0;

      for (const installment of pendingInstallments) {
        const dueDate = new Date(installment.dueDate);
        
        // Si ya pasó la fecha de vencimiento
        if (dueDate < today) {
          // Calcular días de mora
          const daysOverdue = this.loanService.calculateOverdueDays(dueDate);
          
          // Calcular interés por mora
          const overdueInterest = this.loanService.calculateOverdueInterest(
            installment.amount,
            daysOverdue
          );

          // Actualizar la cuota
          installment.status = InstallmentStatus.OVERDUE;
          installment.daysOverdue = daysOverdue;
          installment.overdueInterest = overdueInterest;
          installment.updateTotalAmount();

          await this.installmentRepository.save(installment);
          processedCount++;
        }
      }

      if (processedCount > 0) {
        console.log(`✅ Se procesaron ${processedCount} cuotas vencidas`);
      }

    } catch (error) {
      console.error('❌ Error procesando cuotas vencidas:', error);
    }
  }
}