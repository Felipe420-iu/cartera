import { api } from './api';
import { Loan, CreateLoanRequest, LoanCalculation } from '../types';

export const loanService = {
  // Obtener todos los préstamos
  async getAll(): Promise<Loan[]> {
    const response = await api.get('/api/loans');
    return response.data;
  },

  // Obtener préstamo por ID
  async getById(id: number): Promise<Loan> {
    const response = await api.get(`/api/loans/${id}`);
    return response.data;
  },

  // Obtener préstamos por cliente
  async getByClient(clientId: number): Promise<Loan[]> {
    const response = await api.get(`/api/loans/client/${clientId}`);
    return response.data;
  },

  // Crear nuevo préstamo
  async create(loan: CreateLoanRequest): Promise<Loan> {
    const response = await api.post('/api/loans', loan);
    return response.data;
  },

  // Calcular préstamo (sin guardar)
  async calculate(loanData: CreateLoanRequest): Promise<LoanCalculation> {
    const response = await api.post('/api/loans/calculate', loanData);
    return response.data;
  },

  // Pagar cuota
  async payInstallment(installmentId: number, paymentDate?: string): Promise<any> {
    const response = await api.put(`/api/loans/installment/${installmentId}/pay`, {
      paymentDate
    });
    return response.data;
  }
};