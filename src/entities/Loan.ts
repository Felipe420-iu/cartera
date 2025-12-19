import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { Installment } from "./Installment";

export enum LoanStatus {
  ACTIVE = 'active',
  PAID = 'paid',
  DEFAULTED = 'defaulted'
}

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 5, scale: 2 })
  interestRate: number; // Porcentaje de interés

  @Column('int')
  installments: number; // Número de cuotas

  @Column('decimal', { precision: 12, scale: 2 })
  installmentAmount: number; // Valor por cuota

  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number; // Total con interés

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: LoanStatus.ACTIVE
  })
  status: LoanStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('int')
  clientId: number;

  @ManyToOne(() => Client, client => client.loans)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @OneToMany(() => Installment, installment => installment.loan)
  installmentsList: Installment[];

  // Campo virtual para obtener el monto pendiente
  get pendingAmount(): number {
    if (!this.installmentsList) return this.totalAmount;
    
    const paidAmount = this.installmentsList
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + Number(i.amount), 0);
    
    return Number(this.totalAmount) - paidAmount;
  }

  // Campo virtual para obtener cuotas vencidas
  get overdueInstallments(): number {
    if (!this.installmentsList) return 0;
    
    return this.installmentsList
      .filter(i => i.status === 'overdue').length;
  }
}