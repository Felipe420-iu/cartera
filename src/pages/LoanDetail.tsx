import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeftIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'
import { loanService } from '../services/loanService'
import { Loan, InstallmentStatus } from '../types'
import { formatCurrency, formatDate } from '../utils/format'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const LoanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [loan, setLoan] = useState<Loan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadLoanData(parseInt(id))
    }
  }, [id])

  const loadLoanData = async (loanId: number) => {
    try {
      setLoading(true)
      const data = await loanService.getById(loanId)
      setLoan(data)
    } catch (error: any) {
      toast.error('Error al cargar datos del préstamo: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePayInstallment = async (installmentId: number) => {
    if (!window.confirm('¿Confirmar el pago de esta cuota?')) {
      return
    }

    try {
      await loanService.payInstallment(installmentId)
      toast.success('Cuota pagada exitosamente')
      if (id) {
        await loadLoanData(parseInt(id))
      }
    } catch (error: any) {
      toast.error('Error al procesar el pago: ' + error.message)
    }
  }

  const getInstallmentStatusIcon = (status: InstallmentStatus) => {
    switch (status) {
      case InstallmentStatus.PAID:
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case InstallmentStatus.OVERDUE:
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
    }
  }

  const getInstallmentStatusColor = (status: InstallmentStatus) => {
    switch (status) {
      case InstallmentStatus.PAID:
        return 'bg-green-50 text-green-800'
      case InstallmentStatus.OVERDUE:
        return 'bg-red-50 text-red-800'
      default:
        return 'bg-yellow-50 text-yellow-800'
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Préstamo no encontrado</p>
        <Link to="/loans" className="btn-primary mt-4">
          Volver a Préstamos
        </Link>
      </div>
    )
  }

  const paidInstallments = loan.installmentsList?.filter(i => i.status === InstallmentStatus.PAID) || []
  const pendingInstallments = loan.installmentsList?.filter(i => i.status === InstallmentStatus.PENDING) || []
  const overdueInstallments = loan.installmentsList?.filter(i => i.status === InstallmentStatus.OVERDUE) || []

  const paidAmount = paidInstallments.reduce((sum, i) => sum + Number(i.totalAmount), 0)
  const progress = (paidAmount / Number(loan.totalAmount)) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/loans" className="text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Préstamo #{loan.id}
            </h1>
            <p className="text-gray-600">
              {loan.client?.fullName} - {loan.client?.documentId}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            loan.status === 'active' 
              ? 'bg-green-100 text-green-800'
              : loan.status === 'paid'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {loan.status === 'active' ? 'Activo' : loan.status === 'paid' ? 'Pagado' : 'Vencido'}
          </span>
        </div>
      </div>

      {/* Loan Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Información del Préstamo</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Monto Original</span>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(loan.amount)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total con Intereses</span>
                <p className="text-xl font-bold text-green-600">{formatCurrency(loan.totalAmount)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Tasa de Interés</span>
                <p className="font-medium">{loan.interestRate}% anual</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Número de Cuotas</span>
                <p className="font-medium">{loan.installments}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Valor por Cuota</span>
                <p className="font-medium">{formatCurrency(loan.installmentAmount)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Pendiente</span>
                <p className="font-medium text-yellow-600">{formatCurrency(loan.pendingAmount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Fecha de Inicio</span>
                <p className="font-medium">{formatDate(loan.startDate)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Fecha de Fin</span>
                <p className="font-medium">{formatDate(loan.endDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress and Stats */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Progreso del Pago</h2>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{paidInstallments.length}</div>
              <div className="text-sm text-gray-600">Pagadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{pendingInstallments.length}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{overdueInstallments.length}</div>
              <div className="text-sm text-gray-600">Vencidas</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Recibido</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Installments Table */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Cronograma de Pagos</h2>
        
        {loan.installmentsList && loan.installmentsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Monto Cuota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Interés Mora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loan.installmentsList.map((installment) => (
                  <tr key={installment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {installment.installmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(installment.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(installment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {installment.overdueInterest > 0 ? formatCurrency(installment.overdueInterest) : '-'}
                      {installment.daysOverdue > 0 && (
                        <div className="text-xs text-red-500">
                          {installment.daysOverdue} días
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(installment.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getInstallmentStatusIcon(installment.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInstallmentStatusColor(installment.status)}`}>
                          {installment.status === InstallmentStatus.PAID ? 'Pagada' : 
                           installment.status === InstallmentStatus.OVERDUE ? 'Vencida' : 'Pendiente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {installment.paidDate ? formatDate(installment.paidDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {installment.status !== InstallmentStatus.PAID && (
                        <button
                          onClick={() => handlePayInstallment(installment.id)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                        >
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No se encontraron cuotas para este préstamo</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoanDetail