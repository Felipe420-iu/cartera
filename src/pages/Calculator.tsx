import React, { useState } from 'react'
import { CalculatorIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { loanService } from '../services/loanService'
import { LoanCalculation } from '../types'
import { formatCurrency, formatDate, formatPercentage } from '../utils/format'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const Calculator: React.FC = () => {
  const [formData, setFormData] = useState({
    amount: '',
    interestRate: '',
    installments: '',
    startDate: new Date().toISOString().split('T')[0],
  })
  
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.interestRate || !formData.installments) {
      toast.error('Por favor completa todos los campos')
      return
    }

    try {
      setLoading(true)
      const data = await loanService.calculate({
        clientId: 0, // No necesario para cálculo
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        installments: parseInt(formData.installments),
        startDate: formData.startDate,
      })
      
      setCalculation(data)
    } catch (error: any) {
      toast.error('Error al calcular: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      amount: '',
      interestRate: '',
      installments: '',
      startDate: new Date().toISOString().split('T')[0],
    })
    setCalculation(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CalculatorIcon className="h-8 w-8 mr-3 text-primary-600" />
          Calculadora de Préstamos
        </h1>
        <p className="text-gray-600">Simula diferentes escenarios de préstamos con el sistema francés</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Cálculo */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Parámetros del Préstamo</h2>
          
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="label">Monto del Préstamo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="1000000"
                  min="1"
                  step="1000"
                />
              </div>
            </div>

            <div>
              <label className="label">Tasa de Interés Anual (%)</label>
              <input
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                className="input-field"
                placeholder="24"
                min="0.1"
                max="200"
                step="0.1"
              />
            </div>

            <div>
              <label className="label">Número de Cuotas</label>
              <select
                name="installments"
                value={formData.installments}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Selecciona...</option>
                {[3, 6, 12, 18, 24, 36, 48, 60].map(months => (
                  <option key={months} value={months}>{months} meses</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Fecha de Inicio</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Calculando...' : 'Calcular'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>

        {/* Resultados */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resultados</h2>
          
          {loading ? (
            <LoadingSpinner />
          ) : calculation ? (
            <div className="space-y-4">
              {/* Resumen Principal */}
              <div className="bg-primary-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary-900 mb-3">Resumen</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-primary-600">Cuota Mensual</p>
                    <p className="text-xl font-bold text-primary-900">
                      {formatCurrency(calculation.installmentAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-600">Total a Pagar</p>
                    <p className="text-xl font-bold text-primary-900">
                      {formatCurrency(calculation.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto del Préstamo</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(formData.amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de Intereses</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(calculation.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa de Interés</span>
                  <span className="font-semibold">{formatPercentage(parseFloat(formData.interestRate))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de Cuotas</span>
                  <span className="font-semibold">{formData.installments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de Finalización</span>
                  <span className="font-semibold">{formatDate(calculation.endDate)}</span>
                </div>
              </div>

              {/* Indicador de Rentabilidad */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rentabilidad</span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatPercentage((calculation.totalInterest / parseFloat(formData.amount)) * 100)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalculatorIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Completa los campos y haz clic en "Calcular" para ver los resultados</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Amortización */}
      {calculation && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tabla de Amortización</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cuota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Monto Cuota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Capital
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Interés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Saldo Pendiente
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculation.installmentSchedule.map((installment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {installment.installmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(installment.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(installment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(installment.principalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency(installment.interestAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(installment.remainingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calculator