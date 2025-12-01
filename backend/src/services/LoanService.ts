export interface LoanCalculation {
  installmentAmount: number;
  totalAmount: number;
  totalInterest: number;
  endDate: Date;
  installmentSchedule: InstallmentData[];
}

export interface InstallmentData {
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  remainingBalance: number;
}

export class LoanService {
  /**
   * Calcula un préstamo usando el sistema francés (cuota fija)
   * @param amount Monto del préstamo
   * @param annualInterestRate Tasa de interés anual (ejemplo: 24 para 24%)
   * @param installments Número de cuotas
   * @param startDate Fecha de inicio
   * @returns Cálculo completo del préstamo
   */
  calculateLoan(
    amount: number,
    annualInterestRate: number,
    installments: number,
    startDate: Date
  ): LoanCalculation {
    // Convertir tasa anual a mensual
    const monthlyInterestRate = (annualInterestRate / 100) / 12;
    
    // Calcular cuota fija usando la fórmula del sistema francés
    const installmentAmount = this.calculateInstallmentAmount(
      amount,
      monthlyInterestRate,
      installments
    );

    const totalAmount = installmentAmount * installments;
    const totalInterest = totalAmount - amount;

    // Calcular cronograma de pagos
    const installmentSchedule = this.generateInstallmentSchedule(
      amount,
      installmentAmount,
      monthlyInterestRate,
      installments,
      startDate
    );

    // Calcular fecha de fin
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + installments);

    return {
      installmentAmount: Math.round(installmentAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      endDate,
      installmentSchedule
    };
  }

  /**
   * Calcula el monto de cuota fija usando la fórmula del sistema francés
   */
  private calculateInstallmentAmount(
    principal: number,
    monthlyRate: number,
    installments: number
  ): number {
    if (monthlyRate === 0) {
      return principal / installments;
    }

    const factor = Math.pow(1 + monthlyRate, installments);
    return (principal * monthlyRate * factor) / (factor - 1);
  }

  /**
   * Genera el cronograma detallado de pagos
   */
  private generateInstallmentSchedule(
    principal: number,
    installmentAmount: number,
    monthlyRate: number,
    installments: number,
    startDate: Date
  ): InstallmentData[] {
    const schedule: InstallmentData[] = [];
    let remainingBalance = principal;

    for (let i = 1; i <= installments; i++) {
      // Calcular interés sobre el saldo pendiente
      const interestAmount = remainingBalance * monthlyRate;
      
      // El capital es lo que queda después de pagar el interés
      const principalAmount = installmentAmount - interestAmount;
      
      // Actualizar saldo pendiente
      remainingBalance -= principalAmount;

      // Calcular fecha de vencimiento
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        installmentNumber: i,
        amount: Math.round(installmentAmount * 100) / 100,
        dueDate,
        principalAmount: Math.round(principalAmount * 100) / 100,
        interestAmount: Math.round(interestAmount * 100) / 100,
        remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100)
      });
    }

    return schedule;
  }

  /**
   * Calcula el interés por mora basado en días de retraso
   * @param amount Monto de la cuota
   * @param daysOverdue Días de retraso
   * @param dailyOverdueRate Tasa diaria de mora (ejemplo: 0.1 para 0.1% diario)
   * @returns Interés por mora
   */
  calculateOverdueInterest(
    amount: number,
    daysOverdue: number,
    dailyOverdueRate: number = 0.001 // 0.1% diario por defecto
  ): number {
    const overdueInterest = amount * dailyOverdueRate * daysOverdue;
    return Math.round(overdueInterest * 100) / 100;
  }

  /**
   * Calcula los días de retraso entre dos fechas
   */
  calculateDaysOverdue(dueDate: Date, currentDate: Date = new Date()): number {
    if (currentDate <= dueDate) return 0;
    
    const timeDiff = currentDate.getTime() - dueDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  }
}