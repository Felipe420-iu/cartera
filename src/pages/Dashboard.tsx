import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CurrencyDollarIcon,
  UsersIcon,
  CalendarDaysIcon,
  CalculatorIcon,
  PencilSquareIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

type Frequency = 'daily' | 'weekly' | 'monthly'
type InstallmentStatus = 'PENDING' | 'PAID' | 'LATE'

interface LocalInstallment {
  installmentNumber: number
  amount: number
  dueDate: string
  status?: InstallmentStatus
  paidDate?: string
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

interface Client {
  id?: number
  name: string
  lastName: string
  active?: boolean
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(value) || 0)

const deriveStatus = (inst: LocalInstallment, today: string): InstallmentStatus => {
  if (inst.status === 'PAID') return 'PAID'
  return new Date(inst.dueDate) < new Date(today) ? 'LATE' : 'PENDING'
}

const Dashboard: React.FC = () => {
  const [loans, setLoans] = useState<LocalLoan[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [capitalBase, setCapitalBase] = useState<number>(0)
  const [capitalInput, setCapitalInput] = useState('')
  const [editingCapital, setEditingCapital] = useState(false)

  useEffect(() => {
    const storedLoans = localStorage.getItem('loans')
    if (storedLoans) {
      try {
        setLoans(JSON.parse(storedLoans))
      } catch (err) {
        console.error('No se pudieron leer los préstamos', err)
      }
    }
    const storedClients = localStorage.getItem('clients')
    if (storedClients) {
      try {
        setClients(JSON.parse(storedClients))
      } catch (err) {
        console.error('No se pudieron leer los clientes', err)
      }
    }
    const storedCapital = localStorage.getItem('capitalBase')
    if (storedCapital !== null) {
      setCapitalInput(storedCapital)
      const parsed = Number(storedCapital)
      if (!Number.isNaN(parsed)) setCapitalBase(parsed)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('capitalBase', capitalInput)
  }, [capitalInput])

  const metrics = useMemo(() => {
    let totalProgramado = 0
    let saldoPendiente = 0
    let totalCobrado = 0

    loans.forEach(loan => {
      loan.schedule.forEach(inst => {
        const amount = Number(inst.amount) || 0
        totalProgramado += amount
        const status = deriveStatus(inst, todayStr)
        if (status === 'PAID') totalCobrado += amount
        else saldoPendiente += amount
      })
    })

    const utilidadProyectada = totalProgramado - (capitalBase || 0)

    return {
      totalProgramado,
      saldoPendiente,
      totalCobrado,
      utilidadProyectada,
      clientesActivos: clients.filter(c => c.active !== false).length,
      totalPrestamos: loans.length
    }
  }, [loans, clients, todayStr, capitalBase])

  return (
    <div className="space-y-6">
      {/* Header minimal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 CHACHAN FACTURANDO</h1>
          <p className="text-gray-600 mt-1">Tu panel rápido de cartera</p>
        </div>
        <div className="flex gap-2">
          <Link to="/clients" className="btn-primary">Clientes</Link>
          <Link to="/loans" className="btn-secondary">Préstamos</Link>
        </div>
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Capital base</p>
              {editingCapital ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    className="input-field w-32"
                    value={capitalInput}
                    placeholder="Ingresa capital"
                    onChange={(e) => {
                      const value = e.target.value
                      setCapitalInput(value)
                      const numeric = Number(value)
                      setCapitalBase(value === '' || Number.isNaN(numeric) ? 0 : numeric)
                    }}
                  />
                  <button
                    className="btn-primary px-3"
                    onClick={() => setEditingCapital(false)}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{formatMoney(capitalBase)}</p>
              )}
              <p className="text-xs text-gray-500">Tu capital invertido (editable)</p>
            </div>
            <button
              className="p-3 rounded-full bg-blue-50 hover:bg-blue-100"
              onClick={() => setEditingCapital(true)}
              title="Editar capital base"
            >
              <PencilSquareIcon className="h-6 w-6 text-blue-600" />
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de la cartera</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(metrics.totalProgramado)}</p>
              <p className="text-xs text-gray-500">Todo lo programado (capital + recargos)</p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Saldo pendiente</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(metrics.saldoPendiente)}</p>
              <p className="text-xs text-gray-500">Por cobrar (pendiente + en mora)</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50">
              <CalendarDaysIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Utilidad proyectada</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(metrics.utilidadProyectada)}</p>
              <p className="text-xs text-gray-500">Total cartera - capital base</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* KPIs secundarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cobrado</p>
              <p className="text-xl font-bold text-gray-900">{formatMoney(metrics.totalCobrado)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clientes activos</p>
              <p className="text-xl font-bold text-gray-900">{metrics.clientesActivos}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Préstamos creados</p>
              <p className="text-xl font-bold text-gray-900">{metrics.totalPrestamos}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/clients"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Clientes</h3>
              <p className="text-sm text-gray-600">Gestionar clientes</p>
            </div>
          </div>
        </Link>

        <Link
          to="/loans"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Préstamos</h3>
              <p className="text-sm text-gray-600">Ver préstamos</p>
            </div>
          </div>
        </Link>

        <Link
          to="/calculator"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50">
              <CalculatorIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Calculadora</h3>
              <p className="text-sm text-gray-600">Simular préstamos</p>
            </div>
          </div>
        </Link>

        <Link
          to="/calendar"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-50">
              <CalendarDaysIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Calendario</h3>
              <p className="text-sm text-gray-600">Ver vencimientos</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard