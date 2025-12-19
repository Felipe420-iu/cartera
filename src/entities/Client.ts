import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Loan } from "./Loan";

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 100 })
  lastName: string;

  @Column('varchar', { length: 20, unique: true })
  documentId: string;

  @Column('varchar', { length: 15, nullable: true })
  phone?: string;

  @Column('varchar', { length: 100, nullable: true })
  email?: string;

  @Column('varchar', { length: 200, nullable: true })
  address?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Loan, loan => loan.client)
  loans: Loan[];

  // Campo virtual para obtener el nombre completo
  get fullName(): string {
    return `${this.name} ${this.lastName}`;
  }
}