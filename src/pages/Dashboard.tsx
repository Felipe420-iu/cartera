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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await summaryService.getSummary()
      setSummary(data)
    } catch (error: any) {
      console.error('Error cargando resumen:', error)
      setError(error.message || 'Error al cargar datos')
      
      // Datos por defecto para mostrar interfaz
      setSummary({
        totalLent: 0,
        totalWithInterest: 0,
        totalReceived: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalInterestEarned: 0,
        activeLoansCount: 0,
        overdueInstallments: 0,
        upcomingInstallments: 0,
        upcomingPayments: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Error al cargar el dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'No se pudieron cargar los datos'}
          </p>
          <button onClick={loadSummary} className="btn-primary">
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Prestado',
      value: formatCurrency(summary.totalLent || 0),
      icon: CurrencyDollarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total con Intereses',
      value: formatCurrency(summary.totalWithInterest || 0),
      icon: TrendingUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Total Recibido',
      value: formatCurrency(summary.totalReceived || 0),
      icon: BanknotesIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'Pendiente de Cobro',
      value: formatCurrency(summary.totalPending || 0),
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Cuotas Vencidas',
      value: formatCurrency(summary.totalOverdue || 0),
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      name: 'Intereses Ganados',
      value: formatCurrency(summary.totalInterestEarned || 0),
      icon: CheckCircleIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen general de tu cartera de préstamos</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/clients" className="btn-primary">
            Nuevo Cliente
          </Link>
          <Link to="/calculator" className="btn-secondary">
            Calcular Préstamo
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Mostrando datos por defecto. Error: {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loans Overview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UsersIcon className="h-5 w-5 mr-2 text-primary-600" />
            Resumen de Préstamos
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Préstamos Activos</span>
              <span className="font-semibold text-gray-900">{summary.activeLoansCount || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Cuotas por Vencer (7 días)</span>
              <span className="font-semibold text-yellow-600">{summary.upcomingInstallments || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Cuotas Vencidas</span>
              <span className="font-semibold text-red-600">{summary.overdueInstallments || 0}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link to="/loans" className="text-primary-600 hover:text-primary-700 font-medium">
              Ver todos los préstamos →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Acciones Rápidas</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/clients"
              className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200"
            >
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Gestionar Clientes</p>
                <p className="text-sm text-gray-600">Agregar y editar clientes</p>
              </div>
            </Link>
            
            <Link
              to="/calculator"
              className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200"
            >
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Calculadora de Préstamos</p>
                <p className="text-sm text-gray-600">Simular nuevos préstamos</p>
              </div>
            </Link>
            
            <Link
              to="/calendar"
              className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200"
            >
              <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Calendario de Pagos</p>
                <p className="text-sm text-gray-600">Ver fechas de vencimiento</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Welcome Message for Empty State */}
      {summary.activeLoansCount === 0 && (
        <div className="card text-center">
          <div className="py-12">
            <CurrencyDollarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Bienvenido a tu Cartera Virtual!</h3>
            <p className="text-gray-600 mb-6">
              Aún no tienes préstamos registrados. Comienza creando tu primer cliente y luego agrega un préstamo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/clients" className="btn-primary">
                Crear Primer Cliente
              </Link>
              <Link to="/calculator" className="btn-secondary">
                Probar Calculadora
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button 
          onClick={loadSummary} 
          className="btn-secondary"
          disabled={loading}
        >
          {loading ? 'Actualizando...' : '🔄 Actualizar Datos'}
        </button>
      </div>
    </div>
  )
}

export default Dashboard