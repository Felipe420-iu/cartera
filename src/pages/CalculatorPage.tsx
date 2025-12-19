import React, { useMemo, useState } from 'react'
import { Calculator, DollarSign, Calendar, Clock } from 'lucide-react'

type Frequency = 'daily' | 'weekly' | 'monthly'

type ScheduleItem = {
  installmentNumber: number
  amount: number
  dueDate: string
}

const freqLabel: Record<Frequency, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual'
}

const addByFrequency = (date: Date, freq: Frequency) => {
  const next = new Date(date)
  if (freq === 'daily') next.setDate(next.getDate() + 1)
  if (freq === 'weekly') next.setDate(next.getDate() + 7)
  if (freq === 'monthly') next.setMonth(next.getMonth() + 1)
  return next
}

const buildSchedule = (start: string, installments: number, freq: Frequency, installmentAmount: number): ScheduleItem[] => {
  if (!start || installments <= 0 || installmentAmount <= 0) return []
  const schedule: ScheduleItem[] = []
  let cursor = new Date(start)

  for (let i = 1; i <= installments; i++) {
    if (i > 1) {
      cursor = addByFrequency(cursor, freq)
    }
    schedule.push({
      installmentNumber: i,
      amount: Math.round(installmentAmount * 100) / 100,
      dueDate: cursor.toISOString().split('T')[0]
    })
  }
  return schedule
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(value) || 0)

export default function CalculatorPage() {
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [amount, setAmount] = useState<number>(100000)
  const [installmentAmount, setInstallmentAmount] = useState<number>(10000)
  const [installments, setInstallments] = useState<number>(10)
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [startDate, setStartDate] = useState<string>(today)

  const schedule = useMemo(
    () => buildSchedule(startDate, installments, frequency, installmentAmount),
    [startDate, installments, frequency, installmentAmount]
  )

  const totalToPay = installmentAmount * installments
  const profit = totalToPay - amount
  const firstDue = schedule[0]?.dueDate
  const lastDue = schedule[schedule.length - 1]?.dueDate

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calculadora de Préstamo (cuota fija)</h1>
        <p className="text-gray-600 text-sm">Modelo personal: prestas un monto y cobras una cuota fija, sin tasas ni porcentajes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Datos del préstamo</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto prestado</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  min={1000}
                  step={500}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Capital que entregas al cliente.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor de la cuota</label>
                <input
                  type="number"
                  value={installmentAmount || ''}
                  onChange={(e) => setInstallmentAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={100}
                  step={100}
                />
                <p className="text-xs text-gray-500 mt-1">Lo que cobras en cada pago.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de cuotas</label>
                <input
                  type="number"
                  value={installments || ''}
                  onChange={(e) => setInstallments(Number(e.target.value) || 0)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={1}
                  step={1}
                />
                <p className="text-xs text-gray-500 mt-1">Cuántos pagos vas a cobrar.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de pago</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Frequency)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Cada cuánto cobras la cuota.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Fecha del primer cobro.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Resultados</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">Cuota</div>
              <div className="text-2xl font-bold text-blue-900">{formatMoney(installmentAmount)}</div>
              <div className="text-xs text-blue-700">{freqLabel[frequency]}</div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">Total a cobrar</div>
              <div className="text-2xl font-bold text-green-900">{formatMoney(totalToPay)}</div>
              <div className="text-xs text-green-700">{installments} cuotas</div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
              <div className="text-sm text-orange-700 mb-1">Ganancia</div>
              <div className="text-2xl font-bold text-orange-900">{formatMoney(profit)}</div>
              <div className="text-xs text-orange-700">Total - capital prestado</div>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="text-sm text-purple-700 mb-1">Plazo</div>
              <div className="text-xl font-bold text-purple-900">{installments} pagos</div>
              <div className="text-xs text-purple-700">{freqLabel[frequency]}</div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span>Primer cobro: {firstDue ? new Date(firstDue).toLocaleDateString('es-CO') : '—'}</span>
            </div>
            <div>Último cobro: {lastDue ? new Date(lastDue).toLocaleDateString('es-CO') : '—'}</div>
          </div>
        </div>
      </div>

      {/* Cronograma */}
      {schedule.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cronograma (primeras 10 cuotas)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-500 uppercase text-xs">#</th>
                  <th className="px-4 py-3 text-left text-gray-500 uppercase text-xs">Fecha</th>
                  <th className="px-4 py-3 text-left text-gray-500 uppercase text-xs">Monto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedule.slice(0, 10).map(item => (
                  <tr key={item.installmentNumber}>
                    <td className="px-4 py-3 text-gray-900">{item.installmentNumber}</td>
                    <td className="px-4 py-3 text-gray-900">{new Date(item.dueDate).toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-3 text-gray-900">{formatMoney(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {schedule.length > 10 && (
            <div className="mt-3 text-xs text-gray-500">Total de cuotas: {schedule.length}. Se muestran las primeras 10.</div>
          )}
        </div>
      )}
    </div>
  )
}