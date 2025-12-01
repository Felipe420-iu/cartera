import * as cron from 'node-cron';
import { AppDataSource } from '../config/database';
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

  /**
   * Inicia el cron job que se ejecuta diariamente a las 6:00 AM
   */
  start(): void {
    // Ejecutar todos los días a las 6:00 AM
    cron.schedule('0 6 * * *', async () => {
      console.log('🔄 Iniciando tarea de revisión de cuotas vencidas:', new Date().toISOString());
      await this.processOverdueInstallments();
    });

    console.log('⏰ Cron job de cuotas vencidas iniciado - se ejecutará diariamente a las 6:00 AM');
  }

  /**
   * Procesa todas las cuotas vencidas y calcula intereses de mora
   */
  async processOverdueInstallments(): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Establecer a inicio del día

      // Buscar cuotas pendientes que ya vencieron
      const overdueInstallments = await this.installmentRepository
        .createQueryBuilder('installment')
        .leftJoinAndSelect('installment.loan', 'loan')
        .where('installment.status = :status', { status: InstallmentStatus.PENDING })
        .andWhere('installment.dueDate < :today', { today })
        .andWhere('loan.status = :loanStatus', { loanStatus: 'active' })
        .getMany();

      console.log(`📋 Encontradas ${overdueInstallments.length} cuotas para procesar`);

      let processedCount = 0;
      let updatedCount = 0;

      for (const installment of overdueInstallments) {
        try {
          // Marcar como vencida si no lo está ya
          if (installment.status === InstallmentStatus.PENDING) {
            installment.status = InstallmentStatus.OVERDUE;
            updatedCount++;
          }

          // Calcular días de mora
          const daysOverdue = this.loanService.calculateDaysOverdue(
            new Date(installment.dueDate),
            today
          );

          // Solo actualizar si los días de mora han cambiado
          if (installment.daysOverdue !== daysOverdue) {
            installment.daysOverdue = daysOverdue;

            // Calcular nuevo interés por mora
            const newOverdueInterest = this.loanService.calculateOverdueInterest(
              Number(installment.amount),
              daysOverdue,
              0.001 // 0.1% diario
            );

            installment.overdueInterest = newOverdueInterest;
            installment.updateTotalAmount();

            console.log(`💰 Cuota ${installment.id}: ${daysOverdue} días de mora, interés: $${newOverdueInterest}`);
          }

          await this.installmentRepository.save(installment);
          processedCount++;

        } catch (error) {
          console.error(`❌ Error procesando cuota ${installment.id}:`, error);
        }
      }

      console.log(`✅ Tarea completada: ${processedCount} cuotas procesadas, ${updatedCount} marcadas como vencidas`);

      // Opcional: enviar notificaciones o generar reportes
      if (overdueInstallments.length > 0) {
        await this.generateOverdueReport(overdueInstallments);
      }

    } catch (error) {
      console.error('❌ Error en la tarea de cuotas vencidas:', error);
    }
  }

  /**
   * Genera un reporte de cuotas vencidas (opcional)
   */
  private async generateOverdueReport(overdueInstallments: Installment[]): Promise<void> {
    try {
      const report = {
        date: new Date().toISOString(),
        totalOverdueInstallments: overdueInstallments.length,
        totalOverdueAmount: overdueInstallments.reduce(
          (sum, inst) => sum + Number(inst.totalAmount),
          0
        ),
        clientsAffected: new Set(overdueInstallments.map(inst => inst.loan?.clientId)).size,
        details: overdueInstallments.map(inst => ({
          installmentId: inst.id,
          clientId: inst.loan?.clientId,
          loanId: inst.loanId,
          daysOverdue: inst.daysOverdue,
          amount: inst.amount,
          overdueInterest: inst.overdueInterest,
          totalAmount: inst.totalAmount
        }))
      };

      console.log('📊 Reporte de cuotas vencidas:', {
        total: report.totalOverdueInstallments,
        monto: `$${report.totalOverdueAmount.toFixed(2)}`,
        clientes: report.clientsAffected
      });

      // Aquí podrías guardar el reporte en base de datos, enviarlo por email, etc.

    } catch (error) {
      console.error('❌ Error generando reporte:', error);
    }
  }

  /**
   * Ejecuta la tarea manualmente (útil para testing)
   */
  async runManually(): Promise<void> {
    console.log('🔧 Ejecutando tarea de cuotas vencidas manualmente...');
    await this.processOverdueInstallments();
  }
}