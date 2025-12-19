export interface Client {
  id: number;
  name: string;
  lastName: string;
  documentId: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  loans?: Loan[];
  fullName: string;
}

export interface CreateClientRequest {
  name: string;
  lastName: string;
  documentId: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateClientRequest extends CreateClientRequest {}

export enum LoanStatus {
  ACTIVE = 'active',
  PAID = 'paid',
  DEFAULTED = 'defaulted'
}

export interface Loan {
  id: number;
  amount: number;
  interestRate: number;
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
  clientId: number;
  client?: Client;
  installmentsList?: Installment[];
  pendingAmount: number;
  overdueInstallments: number;
}

export interface CreateLoanRequest {
  clientId: number;
  amount: number;
  interestRate: number;
  installments: number;
  startDate: string;
}

export enum InstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue'
}

export interface Installment {
  id: number;
  installmentNumber: number;
  amount: number;
  overdueInterest: number;
  totalAmount: number;
  dueDate: string;
  paidDate?: string;
  status: InstallmentStatus;
  daysOverdue: number;
  createdAt: string;
  updatedAt: string;
  loanId: number;
  loan?: Loan;
}

export interface LoanCalculation {
  installmentAmount: number;
  totalAmount: number;
  totalInterest: number;
  endDate: string;
  installmentSchedule: InstallmentData[];
}

export interface InstallmentData {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  remainingBalance: number;
}

export interface Summary {
  totalLent: number;
  totalWithInterest: number;
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  totalInterestEarned: number;
  activeLoansCount: number;
  upcomingInstallments: number;
  overdueInstallments: number;
  upcomingPayments: UpcomingPayment[];
}

export interface UpcomingPayment {
  id: number;
  clientName: string;
  amount: number;
  dueDate: string;
  installmentNumber: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    clientId: number;
    clientName: string;
    loanId: number;
    installmentNumber: number;
    amount: number;
    status: InstallmentStatus;
    overdueInterest: number;
  };
}