import React, { useState } from 'react'
import { CalculatorIcon } from '@heroicons/react/24/outline'

const Calculator: React.FC = () => {
  const [amount, setAmount] = useState<string>('')
  const [interestRate, setInterestRate] = useState<string>('')
  const [installments, setInstallments] = useState<string>('')
  const [result, setResult] = useState<any>(null)

  const calculateLoan = () => {
    const principal = parseFloat(amount)
    const rate = parseFloat(interestRate) / 100 / 12
    const periods = parseInt(installments)

    if (!principal || !rate || !periods) {
      alert('Por favor complete todos los campos')
      return
    }

    const installmentAmount = rate === 0 
      ? principal / periods 
      : (principal * rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1)

    const totalAmount = installmentAmount * periods
    const totalInterest = totalAmount - principal

    setResult({
      installmentAmount: installmentAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalInterest: totalInterest.toFixed(2)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <CalculatorIcon className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Calculadora de Préstamos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos del Préstamo</h3>
          
          <div className="space-y-4">
            <div>
              <label className="label">Monto del Préstamo</label>
              <input
                type="number"
                className="input-field"
                placeholder="Ej: 100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Tasa de Interés Anual (%)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                placeholder="Ej: 24"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Número de Cuotas</label>
              <input
                type="number"
                className="input-field"
                placeholder="Ej: 12"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
              />
            </div>

            <button
              onClick={calculateLoan}
              className="btn-primary w-full"
            >
              Calcular
            </button>
          </div>
        </div>

        {/* Resultado */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultado</h3>
          
          {result ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-green-600 font-medium">Cuota Mensual</p>
                  <p className="text-2xl font-bold text-green-800">
                    ${parseFloat(result.installmentAmount).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total a Pagar</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${parseFloat(result.totalAmount).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Intereses</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${parseFloat(result.totalInterest).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalculatorIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Complete los datos para ver el resultado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Calculator