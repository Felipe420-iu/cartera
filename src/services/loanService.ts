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
   * Calcula un préstamo usando el sistema francés de amortización
   */
  calculateLoan(
    amount: number,
    annualInterestRate: number,
    installments: number,
    startDate: Date
  ): LoanCalculation {
    
    // Convertir tasa anual a tasa mensual
    const monthlyRate = annualInterestRate / 100 / 12;
    
    // Calcular cuota fija usando fórmula del sistema francés
    const installmentAmount = monthlyRate === 0 
      ? amount / installments 
      : (amount * monthlyRate * Math.pow(1 + monthlyRate, installments)) / 
        (Math.pow(1 + monthlyRate, installments) - 1);
    
    const totalAmount = installmentAmount * installments;
    const totalInterest = totalAmount - amount;
    
    // Calcular fecha final
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + installments);
    
    // Generar tabla de amortización
    const installmentSchedule: InstallmentData[] = [];
    let remainingBalance = amount;
    let currentDate = new Date(startDate);
    
    for (let i = 1; i <= installments; i++) {
      // Avanzar al próximo mes
      currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + i);
      
      // Calcular interés y principal de esta cuota
      const interestAmount = remainingBalance * monthlyRate;
      const principalAmount = installmentAmount - interestAmount;
      
      // Actualizar saldo restante
      remainingBalance = Math.max(0, remainingBalance - principalAmount);
      
      installmentSchedule.push({
        installmentNumber: i,
        amount: Math.round(installmentAmount * 100) / 100,
        dueDate: new Date(currentDate),
        principalAmount: Math.round(principalAmount * 100) / 100,
        interestAmount: Math.round(interestAmount * 100) / 100,
        remainingBalance: Math.round(remainingBalance * 100) / 100
      });
    }
    
    return {
      installmentAmount: Math.round(installmentAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      endDate,
      installmentSchedule
    };
  }
  
  /**
   * Calcula los días de mora para una cuota
   */
  calculateOverdueDays(dueDate: Date): number {
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
  
  /**
   * Calcula el interés por mora
   */
  calculateOverdueInterest(
    installmentAmount: number, 
    daysOverdue: number, 
    overdueRate: number = 0.05 // 5% mensual por defecto
  ): number {
    if (daysOverdue <= 0) return 0;
    
    // Calcular interés por mora (proporcional a los días)
    const monthlyOverdueRate = overdueRate / 30; // Tasa diaria
    const overdueInterest = installmentAmount * monthlyOverdueRate * daysOverdue;
    
    return Math.round(overdueInterest * 100) / 100;
  }
}