import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Loan } from "./Loan";

export enum InstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue'
}

@Entity('installments')
export class Installment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  installmentNumber: number; // Número de cuota (1, 2, 3...)

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number; // Monto de la cuota

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  overdueInterest: number; // Interés por mora

  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number; // Monto total (cuota + mora)

  @Column('date')
  dueDate: Date; // Fecha de vencimiento

  @Column('date', { nullable: true })
  paidDate?: Date; // Fecha de pago

  @Column({
    type: 'enum',
    enum: InstallmentStatus,
    default: InstallmentStatus.PENDING
  })
  status: InstallmentStatus;

  @Column('int')
  daysOverdue: number = 0; // Días de mora

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('int')
  loanId: number;

  @ManyToOne(() => Loan, loan => loan.installmentsList)
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  // Actualizar el monto total cuando hay interés por mora
  updateTotalAmount(): void {
    this.totalAmount = Number(this.amount) + Number(this.overdueInterest);
  }
}