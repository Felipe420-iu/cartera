import React, { useEffect, useMemo, useState } from 'react'

type Frequency = 'daily' | 'weekly' | 'monthly'
type InstallmentStatus = 'PENDING' | 'PAID' | 'LATE'

interface ClientLite {
  id: number
  name: string
  lastName: string
  documentId: string
}

interface LocalInstallment {
  installmentNumber: number
  amount: number
  dueDate: string
  status: InstallmentStatus
  paidDate?: string
  recargoApplied: boolean
  recargoAmount: number
}

interface LocalLoan {
  id: number
  clientId: number
  clientName: string
  amount: number
  baseInstallmentAmount: number
  installmentAmount: number
  installments: number
  frequency: Frequency
  startDate: string
  endDate: string
  schedule: LocalInstallment[]
  totalToPay: number
}

const Loans: React.FC = () => {
  const [loans, setLoans] = useState<LocalLoan[]>([])
  const [clients, setClients] = useState<ClientLite[]>([])
  const [showForm, setShowForm] = useState(true)
  const [error, setError] = useState('')
  const [recargoFijo, setRecargoFijo] = useState<number>(5000)
  const [hydrated, setHydrated] = useState(false)

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [formData, setFormData] = useState({
    clientId: 0,
    amount: 0,
    installmentAmount: 0,
    installments: 1,
    frequency: 'daily' as Frequency,
    startDate: today
  })

  useEffect(() => {
    const storedClients = localStorage.getItem('clients')
    if (storedClients) {
      try {
        const parsed: any[] = JSON.parse(storedClients)
        setClients(parsed.map(c => ({ id: c.id, name: c.name, lastName: c.lastName, documentId: c.documentId })))
      } catch (err) {
        console.error('No se pudieron leer los clientes', err)
      }
    }

    const storedLoans = localStorage.getItem('loans')
    if (storedLoans) {
      try {
        setLoans(JSON.parse(storedLoans))
      } catch (err) {
        console.error('No se pudieron leer los préstamos', err)
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('loans', JSON.stringify(loans))
  }, [loans, hydrated])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'frequency') {
      setFormData(prev => ({ ...prev, frequency: value as Frequency }))
      return
    }
    setFormData(prev => ({
      ...prev,
      [name]: name === 'clientId' ? Number(value) : Number(value)
    }))
  }

  const buildSchedule = (start: string, installments: number, freq: Frequency, installmentAmount: number): LocalInstallment[] => {
    const schedule: LocalInstallment[] = []
    let cursor = new Date(start)

    for (let i = 1; i <= installments; i++) {
      if (i > 1) {
        const next = new Date(cursor)
        if (freq === 'daily') next.setDate(next.getDate() + 1)
        if (freq === 'weekly') next.setDate(next.getDate() + 7)
        if (freq === 'monthly') next.setMonth(next.getMonth() + 1)
        cursor = next
      }

      schedule.push({
        installmentNumber: i,
        amount: Math.round(installmentAmount * 100) / 100,
        dueDate: cursor.toISOString().split('T')[0],
        status: 'PENDING',
        recargoApplied: false,
        recargoAmount: 0
      })
    }
    return schedule
  }

  const getOverdueDays = (inst: LocalInstallment): number => {
    if (inst.status === 'PAID') return 0
    const todayDate = new Date()
    const dueDate = new Date(inst.dueDate)
    const diffTime = todayDate.getTime() - dueDate.getTime()
    return diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0
  }

  const deriveStatus = (inst: LocalInstallment): InstallmentStatus => {
    if (inst.status === 'PAID') return 'PAID'
    return new Date(inst.dueDate) < new Date() ? 'LATE' : 'PENDING'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { clientId, amount, installmentAmount, installments, frequency, startDate } = formData

    if (!clientId || !amount || !installmentAmount || !installments || !startDate) {
      setError('Completa todos los campos del préstamo')
      return
    }

    if (installmentAmount * installments < amount) {
      setError('El total a pagar debe ser mayor o igual al monto prestado')
      return
    }

    const schedule = buildSchedule(startDate, installments, frequency, installmentAmount)
    const totalToPay = installmentAmount * installments
    const endDate = schedule[schedule.length - 1]?.dueDate || startDate
    const client = clients.find(c => c.id === clientId)

    const newLoan: LocalLoan = {
      id: Date.now(),
      clientId,
      clientName: client ? `${client.name} ${client.lastName}` : 'Cliente',
      amount,
      baseInstallmentAmount: installmentAmount,
      installmentAmount: Math.round(installmentAmount * 100) / 100,
      installments,
      frequency,
      startDate,
      endDate,
      schedule,
      totalToPay
    }

    setLoans(prev => [newLoan, ...prev])
    setShowForm(false)
    setFormData({ clientId: 0, amount: 0, installmentAmount: 0, installments: 1, frequency: 'daily', startDate: today })
  }

  const markPaid = (loanId: number, installmentNumber: number) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id !== loanId) return loan
      const schedule = loan.schedule.map(inst => {
        if (inst.installmentNumber !== installmentNumber) return inst
        return { ...inst, status: 'PAID', paidDate: new Date().toISOString() }
      })
      return { ...loan, schedule }
    }))
  }

  const applyRecargo = (loanId: number, installmentNumber: number) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id !== loanId) return loan
      const schedule = loan.schedule.map(inst => {
        if (inst.installmentNumber !== installmentNumber) return inst
        const overdueDays = getOverdueDays(inst)
        if (inst.status === 'PAID' || inst.recargoApplied || overdueDays <= 3) return inst
        const newAmount = inst.amount + recargoFijo
        return {
          ...inst,
          amount: newAmount,
          recargoApplied: true,
          recargoAmount: recargoFijo
        }
      })
      return { ...loan, schedule }
    }))
  }

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(value) || 0)

  const getLoanMetrics = (loan: LocalLoan) => {
    const recargos = loan.schedule.reduce((sum, inst) => sum + (inst.recargoAmount || 0), 0)
    const paid = loan.schedule
      .filter(inst => inst.status === 'PAID')
      .reduce((sum, inst) => sum + inst.amount, 0)
    const total = loan.totalToPay + recargos
    const pending = total - paid
    const hasLate = loan.schedule.some(inst => deriveStatus(inst) === 'LATE')
    const status = hasLate ? 'EN MORA' : 'AL DÍA'
    return { recargos, paid, total, pending, status }
  }

  const renderStatusChip = (inst: LocalInstallment) => {
    const status = deriveStatus(inst)
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-semibold'
    if (status === 'PAID') return <span className={`${baseClasses} bg-green-100 text-green-800`}>PAGADA</span>
    if (status === 'LATE') return <span className={`${baseClasses} bg-red-100 text-red-800`}>EN MORA</span>
    return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>PENDIENTE</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-gray-600 text-sm">Modelo personal: prestas un monto y cobras una cuota fija, sin tasas ni porcentajes.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cerrar' : 'Nuevo Préstamo'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recargo por mora (opcional y manual)</h3>
            <p className="text-sm text-gray-600">Solo se puede aplicar si la cuota lleva más de 3 días vencida.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Recargo fijo:</span>
            <input
              type="number"
              value={recargoFijo}
              onChange={(e) => setRecargoFijo(Number(e.target.value) || 0)}
              className="input-field w-32"
              min={0}
            />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos del préstamo</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Cliente</label>
              <select
                name="clientId"
                value={formData.clientId || ''}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Selecciona un cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.lastName} - {client.documentId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Monto prestado</label>
              <input
                type="number"
                name="amount"
                value={formData.amount || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Ej: 50000"
                min={1000}
                required
              />
            </div>

            <div>
              <label className="label">Tipo de pago</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div>
              <label className="label">Valor de la cuota</label>
              <input
                type="number"
                name="installmentAmount"
                value={formData.installmentAmount || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Ej: 5000"
                min={100}
                required
              />
            </div>

            <div>
              <label className="label">Número de cuotas</label>
              <input
                type="number"
                name="installments"
                value={formData.installments || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Ej: 14"
                min={1}
                required
              />
            </div>

            <div>
              <label className="label">Fecha de inicio</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700">Cuota: <span className="font-semibold">{formatMoney(formData.installmentAmount || 0)}</span></p>
              <p className="text-sm text-gray-700">Total a pagar: <span className="font-semibold">{formatMoney((formData.installmentAmount || 0) * (formData.installments || 0))}</span></p>
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Crear Préstamo</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Préstamos registrados</h3>
          <span className="text-sm text-gray-500">{loans.length} en total</span>
        </div>

        {loans.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No hay préstamos registrados todavía
          </div>
        )}

        {loans.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prestado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuota</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuotas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo pago</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recargos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo pendiente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map(loan => {
                    const metrics = getLoanMetrics(loan)
                    return (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="font-semibold">{loan.clientName}</div>
                          <div className="text-gray-500 text-xs">ID: {loan.clientId}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatMoney(loan.amount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatMoney(loan.installmentAmount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{loan.installments}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{loan.frequency === 'daily' ? 'Diario' : loan.frequency === 'weekly' ? 'Semanal' : 'Mensual'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatMoney(metrics.recargos)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatMoney(metrics.pending)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${metrics.status === 'EN MORA' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {metrics.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-4">
              {loans.map(loan => {
                const metrics = getLoanMetrics(loan)
                return (
                  <div key={loan.id} className="border rounded-lg p-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3 text-sm text-gray-700">
                      <div>
                        <span className="font-semibold">{loan.clientName}</span> · {loan.installments} cuotas · {loan.frequency === 'daily' ? 'Diario' : loan.frequency === 'weekly' ? 'Semanal' : 'Mensual'}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span>Prestado: <strong>{formatMoney(loan.amount)}</strong></span>
                        <span>Cuota: <strong>{formatMoney(loan.installmentAmount)}</strong></span>
                        <span>Total recargos: <strong>{formatMoney(metrics.recargos)}</strong></span>
                        <span>Saldo pendiente: <strong>{formatMoney(metrics.pending)}</strong></span>
                        <span>Estado: <strong>{metrics.status}</strong></span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-500 uppercase">#</th>
                            <th className="px-3 py-2 text-left text-gray-500 uppercase">Fecha</th>
                            <th className="px-3 py-2 text-left text-gray-500 uppercase">Monto</th>
                            <th className="px-3 py-2 text-left text-gray-500 uppercase">Estado</th>
                            <th className="px-3 py-2 text-left text-gray-500 uppercase">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loan.schedule.map(inst => {
                            const status = deriveStatus(inst)
                            const overdueDays = getOverdueDays(inst)
                            const canApplyRecargo = status === 'LATE' && overdueDays > 3 && !inst.recargoApplied
                            return (
                              <tr key={inst.installmentNumber}>
                                <td className="px-3 py-2 text-gray-900">{inst.installmentNumber}</td>
                                <td className="px-3 py-2 text-gray-900">{new Date(inst.dueDate).toLocaleDateString('es-CO')}</td>
                                <td className="px-3 py-2 text-gray-900">
                                  {formatMoney(inst.amount)}
                                  {inst.recargoApplied && (
                                    <span className="ml-2 text-[11px] text-red-700 bg-red-50 px-2 py-1 rounded-full">+{formatMoney(inst.recargoAmount)} recargo</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-gray-900">{renderStatusChip(inst)}{status === 'LATE' && (<span className="ml-2 text-[11px] text-red-700">({overdueDays} días)</span>)}</td>
                                <td className="px-3 py-2 text-gray-900 space-x-2">
                                  {status !== 'PAID' && (
                                    <button
                                      className="text-blue-600 hover:text-blue-800 text-xs"
                                      onClick={() => markPaid(loan.id, inst.installmentNumber)}
                                    >
                                      Marcar pagada
                                    </button>
                                  )}
                                  {canApplyRecargo && (
                                    <button
                                      className="text-red-600 hover:text-red-800 text-xs"
                                      onClick={() => applyRecargo(loan.id, inst.installmentNumber)}
                                    >
                                      Aplicar recargo
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Loans
