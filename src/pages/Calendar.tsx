import React, { useEffect, useMemo, useState } from 'react'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'

type Frequency = 'daily' | 'weekly' | 'monthly'
type InstallmentStatus = 'PENDING' | 'PAID' | 'LATE'

interface LocalInstallment {
  installmentNumber: number
  amount: number
  dueDate: string
  status?: InstallmentStatus
  paidDate?: string
  recargoApplied?: boolean
  recargoAmount?: number
}

interface LocalLoan {
  id: number
  clientId: number
  clientName: string
  amount: number
  installmentAmount: number
  installments: number
  frequency: Frequency
  startDate: string
  endDate: string
  schedule: LocalInstallment[]
  totalToPay: number
}

interface CalendarItem {
  loanId: number
  clientName: string
  installmentNumber: number
  amount: number
  dueDate: string
  status: InstallmentStatus
  overdueDays: number
  recargoApplied?: boolean
  recargoAmount?: number
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(value) || 0)

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()

const Calendar: React.FC = () => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [loans, setLoans] = useState<LocalLoan[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date())
  const [recargoFijo, setRecargoFijo] = useState<number>(5000)
  const [hydrated, setHydrated] = useState(false)
  const [modalItem, setModalItem] = useState<CalendarItem | null>(null)
  const [applyRecargoNow, setApplyRecargoNow] = useState(false)

  const deriveStatus = (inst: LocalInstallment): InstallmentStatus => {
    if (inst.status === 'PAID') return 'PAID'
    return new Date(inst.dueDate) < new Date(todayStr) ? 'LATE' : 'PENDING'
  }

  const getOverdueDays = (inst: LocalInstallment): number => {
    if (inst.status === 'PAID') return 0
    const todayDate = new Date(todayStr)
    const dueDate = new Date(inst.dueDate)
    const diffTime = todayDate.getTime() - dueDate.getTime()
    return diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0
  }

  useEffect(() => {
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

  const markPaid = (loanId: number, installmentNumber: number) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id !== loanId) return loan
      const schedule = loan.schedule.map(inst => inst.installmentNumber === installmentNumber
        ? { ...inst, status: 'PAID', paidDate: new Date().toISOString() }
        : inst
      )
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
        return {
          ...inst,
          amount: (inst.amount || 0) + recargoFijo,
          recargoApplied: true,
          recargoAmount: recargoFijo,
          status: inst.status || deriveStatus(inst)
        }
      })
      return { ...loan, schedule }
    }))
  }

  const markLate = (loanId: number, installmentNumber: number, withRecargo: boolean) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id !== loanId) return loan
      const schedule = loan.schedule.map(inst => {
        if (inst.installmentNumber !== installmentNumber) return inst
        const overdueDays = getOverdueDays(inst)
        const base = { ...inst, status: 'LATE' as InstallmentStatus, paidDate: undefined }
        if (withRecargo && overdueDays > 3 && !inst.recargoApplied) {
          return {
            ...base,
            amount: (inst.amount || 0) + recargoFijo,
            recargoApplied: true,
            recargoAmount: recargoFijo
          }
        }
        return base
      })
      return { ...loan, schedule }
    }))
  }

  const flattened: CalendarItem[] = useMemo(() => {
    const all = loans.flatMap(loan => loan.schedule.map(inst => ({
      loanId: loan.id,
      clientName: loan.clientName,
      installmentNumber: inst.installmentNumber,
      amount: inst.amount,
      dueDate: inst.dueDate,
      status: deriveStatus(inst),
      overdueDays: getOverdueDays(inst),
      recargoApplied: inst.recargoApplied,
      recargoAmount: inst.recargoAmount
    })))
    all.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    return all
  }, [loans])

  const itemsByDate = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {}
    flattened.forEach(item => {
      if (!map[item.dueDate]) map[item.dueDate] = []
      map[item.dueDate].push(item)
    })
    return map
  }, [flattened])

  const selectedItems = itemsByDate[selectedDate] || []

  const year = monthCursor.getFullYear()
  const month = monthCursor.getMonth()
  const days = daysInMonth(year, month)
  const firstWeekDay = new Date(year, month, 1).getDay() || 7
  const grid: (string | null)[] = Array(firstWeekDay - 1).fill(null).concat(
    Array.from({ length: days }, (_, i) => new Date(year, month, i + 1).toISOString().split('T')[0])
  )

  const goMonth = (delta: number) => {
    const next = new Date(monthCursor)
    next.setMonth(next.getMonth() + delta)
    setMonthCursor(next)
  }

  const renderStatusDot = (list: CalendarItem[]) => {
    const hasLate = list.some(i => i.status === 'LATE')
    const hasPending = list.some(i => i.status === 'PENDING')
    if (hasLate) return <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
    if (hasPending) return <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
    return <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendario de Pagos</h1>
            <p className="text-sm text-gray-600">Vista mensual, selecciona un día para ver y actuar.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary px-3" onClick={() => goMonth(-1)}>◀</button>
          <div className="text-sm font-semibold text-gray-800">{monthCursor.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</div>
          <button className="btn-secondary px-3" onClick={() => goMonth(1)}>▶</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 card">
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-2">
            {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {grid.map((dateStr, idx) => {
              if (!dateStr) return <div key={idx} className="h-24 bg-white border border-dashed border-gray-200 rounded-lg" />
              const list = itemsByDate[dateStr] || []
              const isSelected = dateStr === selectedDate
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-24 w-full text-left rounded-lg border p-2 flex flex-col gap-1 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-800">{new Date(dateStr).getDate()}</span>
                    {list.length > 0 && renderStatusDot(list)}
                  </div>
                  {list.slice(0, 3).map(item => (
                    <div key={`${item.loanId}-${item.installmentNumber}`} className="text-[11px] text-gray-700 truncate">
                      {item.clientName} · {formatMoney(item.amount)}
                    </div>
                  ))}
                  {list.length > 3 && <div className="text-[11px] text-blue-600">+{list.length - 3} más</div>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Seleccionado</div>
              <div className="text-lg font-semibold text-gray-900">{new Date(selectedDate).toLocaleDateString('es-CO')}</div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Recargo:</span>
              <input
                type="number"
                value={recargoFijo}
                onChange={(e) => setRecargoFijo(Number(e.target.value) || 0)}
                className="w-24 input-field"
                min={0}
              />
            </div>
          </div>

          {selectedItems.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Sin cuotas este día</div>
          ) : (
            <div className="space-y-2">
              {selectedItems.map(item => {
                const canApplyRecargo = item.status === 'LATE' && item.overdueDays > 3 && !item.recargoApplied
                const isPaid = item.status === 'PAID'
                return (
                  <div key={`${item.loanId}-${item.installmentNumber}`} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900">{item.clientName} · #{item.installmentNumber}</div>
                      <div className="text-sm text-gray-800">{formatMoney(item.amount)}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{item.status === 'PAID' ? 'PAGADA' : item.status === 'LATE' ? 'EN MORA' : 'PENDIENTE'}</span>
                      {item.overdueDays > 0 && <span className="px-2 py-1 rounded-full bg-red-50 text-red-700">{item.overdueDays} días</span>}
                      {item.recargoApplied && <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700">+{formatMoney(item.recargoAmount || 0)} recargo</span>}
                    </div>
                    <div className="mt-2 flex gap-3 text-xs">
                      {!isPaid && (
                        <button className="text-blue-600 hover:text-blue-800" onClick={() => markPaid(item.loanId, item.installmentNumber)}>
                          Marcar pagada
                        </button>
                      )}
                      {isPaid && (
                        <button className="text-orange-600 hover:text-orange-800" onClick={() => { setModalItem(item); setApplyRecargoNow(false) }}>
                          Marcar en mora
                        </button>
                      )}
                      {canApplyRecargo && (
                        <button className="text-red-600 hover:text-red-800" onClick={() => applyRecargo(item.loanId, item.installmentNumber)}>
                          Aplicar recargo
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {modalItem && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">¿Marcar cuota en mora?</h3>
            <p className="text-sm text-gray-600">
              Esta cuota está marcada como pagada. ¿Quieres moverla a mora y decidir si aplicas el recargo ahora o después?
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <input
                id="recargo-now"
                type="checkbox"
                checked={applyRecargoNow}
                onChange={(e) => setApplyRecargoNow(e.target.checked)}
                disabled={(modalItem.overdueDays || 0) <= 3}
              />
              <label htmlFor="recargo-now" className={((modalItem.overdueDays || 0) <= 3 ? 'text-gray-400' : '') + ' select-none'}>
                Aplicar recargo ahora (solo disponible después de 3 días en mora)
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setModalItem(null)}>Cancelar</button>
              <button
                className="btn-primary"
                onClick={() => {
                  markLate(modalItem.loanId, modalItem.installmentNumber, applyRecargoNow)
                  setModalItem(null)
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar