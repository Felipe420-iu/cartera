import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Client, CreateLoanRequest, LoanCalculation } from '../types'
import { loanService } from '../services/loanService'
import { formatCurrency, formatDate } from '../utils/format'
import toast from 'react-hot-toast'

interface LoanModalProps {
  clients: Client[]
  onSave: (loan: CreateLoanRequest) => void
  onClose: () => void
}

const LoanModal: React.FC<LoanModalProps> = ({ clients, onSave, onClose }) => {
  const [formData, setFormData] = useState<CreateLoanRequest>({
    clientId: 0,
    amount: 0,
    interestRate: 0,
    installments: 0,
    startDate: new Date().toISOString().split('T')[0],
  })
  
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null)
  const [errors, setErrors] = useState<Partial<CreateLoanRequest>>({})
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    if (formData.amount > 0 && formData.interestRate > 0 && formData.installments > 0) {
      calculateLoan()
    }
  }, [formData.amount, formData.interestRate, formData.installments, formData.startDate])

  const calculateLoan = async () => {
    try {
      setCalculating(true)
      const data = await loanService.calculate(formData)
      setCalculation(data)
    } catch (error) {
      setCalculation(null)
    } finally {
      setCalculating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'clientId' || name === 'installments' 
        ? parseInt(value) || 0
        : name === 'amount' || name === 'interestRate'
        ? parseFloat(value) || 0
        : value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof CreateLoanRequest]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateLoanRequest> = {}

    if (!formData.clientId || formData.clientId === 0) {
      newErrors.clientId = 'Debe seleccionar un cliente'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    if (!formData.interestRate || formData.interestRate <= 0) {
      newErrors.interestRate = 'El interés debe ser mayor a 0'
    }

    if (!formData.installments || formData.installments <= 0) {
      newErrors.installments = 'Debe especificar el número de cuotas'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Nuevo Préstamo</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Datos del Préstamo</h4>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Cliente *</label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    className={`input-field ${errors.clientId ? 'border-red-500' : ''}`}
                  >
                    <option value={0}>Selecciona un cliente...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.fullName} - {client.documentId}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
                  )}
                </div>

                <div>
                  <label className="label">Monto del Préstamo *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount || ''}
                    onChange={handleChange}
                    className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
                    placeholder="1000000"
                    min="1"
                    step="1000"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="label">Tasa de Interés Anual (%) *</label>
                  <input
                    type="number"
                    name="interestRate"
                    value={formData.interestRate || ''}
                    onChange={handleChange}
                    className={`input-field ${errors.interestRate ? 'border-red-500' : ''}`}
                    placeholder="24"
                    min="0.1"
                    max="200"
                    step="0.1"
                  />
                  {errors.interestRate && (
                    <p className="mt-1 text-sm text-red-600">{errors.interestRate}</p>
                  )}
                </div>

                <div>
                  <label className="label">Número de Cuotas *</label>
                  <select
                    name="installments"
                    value={formData.installments || ''}
                    onChange={handleChange}
                    className={`input-field ${errors.installments ? 'border-red-500' : ''}`}
                  >
                    <option value="">Selecciona...</option>
                    {[3, 6, 12, 18, 24, 36, 48, 60].map(months => (
                      <option key={months} value={months}>{months} meses</option>
                    ))}
                  </select>
                  {errors.installments && (
                    <p className="mt-1 text-sm text-red-600">{errors.installments}</p>
                  )}
                </div>

                <div>
                  <label className="label">Fecha de Inicio *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`input-field ${errors.startDate ? 'border-red-500' : ''}`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!calculation}
                  >
                    Crear Préstamo
                  </button>
                </div>
              </form>
            </div>

            {/* Cálculo */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Simulación</h4>
              
              {calculating ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-gray-600">Calculando...</span>
                </div>
              ) : calculation ? (
                <div className="space-y-4">
                  {/* Resumen Principal */}
                  <div className="bg-primary-50 rounded-lg p-4">
                    <h5 className="text-md font-semibold text-primary-900 mb-3">Resumen</h5>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between">
                        <span className="text-primary-600">Cuota Mensual</span>
                        <span className="font-bold text-primary-900">
                          {formatCurrency(calculation.installmentAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Total a Pagar</span>
                        <span className="font-bold text-primary-900">
                          {formatCurrency(calculation.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Total Intereses</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(calculation.totalInterest)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Finalización</span>
                      <span>{formatDate(calculation.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rentabilidad</span>
                      <span className="text-green-600 font-semibold">
                        {((calculation.totalInterest / formData.amount) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Preview de primeras cuotas */}
                  {calculation.installmentSchedule.length > 0 && (
                    <div>
                      <h6 className="text-sm font-medium text-gray-900 mb-2">Primeras 3 Cuotas</h6>
                      <div className="space-y-2 text-sm">
                        {calculation.installmentSchedule.slice(0, 3).map((installment, index) => (
                          <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600">
                              Cuota {installment.installmentNumber} - {formatDate(installment.dueDate)}
                            </span>
                            <span className="font-medium">{formatCurrency(installment.amount)}</span>
                          </div>
                        ))}
                        {calculation.installmentSchedule.length > 3 && (
                          <div className="text-center text-gray-500 text-xs py-1">
                            ... y {calculation.installmentSchedule.length - 3} cuotas más
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Completa los datos para ver la simulación</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoanModal