import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TrendingUpIcon,
  UsersIcon,
  CalendarDaysIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { summaryService } from '../services/summaryService'
import { Summary } from '../types'
import { formatCurrency, formatDate } from '../utils/format'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const data = await summaryService.getSummary()
      setSummary(data)
    } catch (error: any) {
      toast.error('Error al cargar el resumen: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error al cargar los datos</p>
        <button onClick={loadSummary} className="btn-primary mt-4">
          Reintentar
        </button>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Prestado',
      value: formatCurrency(summary.totalLent),
      icon: CurrencyDollarIcon,
      change: null,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total con Intereses',
      value: formatCurrency(summary.totalWithInterest),
      icon: TrendingUpIcon,
      change: null,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Total Recibido',
      value: formatCurrency(summary.totalReceived),
      icon: BanknotesIcon,
      change: null,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'Pendiente de Cobro',
      value: formatCurrency(summary.totalPending),
      icon: ClockIcon,
      change: null,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Cuotas Vencidas',
      value: formatCurrency(summary.totalOverdue),
      icon: ExclamationTriangleIcon,
      change: `${summary.overdueInstallments} cuotas`,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      name: 'Intereses Ganados',
      value: formatCurrency(summary.totalInterestEarned),
      icon: CheckCircleIcon,
      change: null,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general de tu cartera de préstamos</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/clients" className="btn-primary">
            Nuevo Cliente
          </Link>
          <Link to="/loans" className="btn-secondary">
            Nuevo Préstamo
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loans Overview */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UsersIcon className="h-5 w-5 mr-2 text-primary-600" />
            Resumen de Préstamos
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Préstamos Activos</span>
              <span className="font-semibold">{summary.activeLoansCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cuotas por Vencer (7 días)</span>
              <span className="font-semibold text-yellow-600">{summary.upcomingInstallments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cuotas Vencidas</span>
              <span className="font-semibold text-red-600">{summary.overdueInstallments}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link to="/loans" className="text-primary-600 hover:text-primary-700 font-medium">
              Ver todos los préstamos →
            </Link>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary-600" />
            Próximos Pagos
          </h3>
          <div className="space-y-3">
            {summary.upcomingPayments.length > 0 ? (
              summary.upcomingPayments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium text-gray-900">{payment.clientName}</p>
                    <p className="text-sm text-gray-500">
                      Cuota #{payment.installmentNumber} - {formatDate(payment.dueDate)}
                    </p>
                  </div>
                  <span className="font-semibold text-primary-600">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay pagos próximos</p>
            )}
          </div>
          {summary.upcomingPayments.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link to="/calendar" className="text-primary-600 hover:text-primary-700 font-medium">
                Ver calendario completo →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/clients"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <UsersIcon className="h-8 w-8 text-primary-600" />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Gestionar Clientes</p>
              <p className="text-sm text-gray-500">Ver y editar clientes</p>
            </div>
          </Link>
          
          <Link
            to="/calculator"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <CalculatorIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Calculadora</p>
              <p className="text-sm text-gray-500">Simular préstamos</p>
            </div>
          </Link>
          
          <Link
            to="/calendar"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Calendario</p>
              <p className="text-sm text-gray-500">Ver vencimientos</p>
            </div>
          </Link>
          
          <button
            onClick={loadSummary}
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <TrendingUpIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Actualizar</p>
              <p className="text-sm text-gray-500">Refrescar datos</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard