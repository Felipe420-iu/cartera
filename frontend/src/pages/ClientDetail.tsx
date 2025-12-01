import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline'
import { clientService } from '../services/clientService'
import { loanService } from '../services/loanService'
import { Client, Loan } from '../types'
import { formatCurrency, formatDate } from '../utils/format'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [client, setClient] = useState<Client | null>(null)
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadClientData(parseInt(id))
    }
  }, [id])

  const loadClientData = async (clientId: number) => {
    try {
      setLoading(true)
      const [clientData, loansData] = await Promise.all([
        clientService.getById(clientId),
        loanService.getByClient(clientId)
      ])
      
      setClient(clientData)
      setLoans(loansData)
    } catch (error: any) {
      toast.error('Error al cargar datos del cliente: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cliente no encontrado</p>
        <Link to="/clients" className="btn-primary mt-4">
          Volver a Clientes
        </Link>
      </div>
    )
  }

  const totalLent = loans.reduce((sum, loan) => sum + Number(loan.amount), 0)
  const totalPending = loans
    .filter(loan => loan.status === 'active')
    .reduce((sum, loan) => sum + loan.pendingAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/clients" className="text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.fullName}</h1>
            <p className="text-gray-600">Detalles del cliente</p>
          </div>
        </div>
        <Link to={`/loans/new?clientId=${client.id}`} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Préstamo
        </Link>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Nombre</span>
                <p className="font-medium">{client.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Apellido</span>
                <p className="font-medium">{client.lastName}</p>
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-600">Documento</span>
              <p className="font-medium">{client.documentId}</p>
            </div>

            {client.phone && (
              <div>
                <span className="text-sm text-gray-600">Teléfono</span>
                <p className="font-medium">{client.phone}</p>
              </div>
            )}

            {client.email && (
              <div>
                <span className="text-sm text-gray-600">Email</span>
                <p className="font-medium">{client.email}</p>
              </div>
            )}

            {client.address && (
              <div>
                <span className="text-sm text-gray-600">Dirección</span>
                <p className="font-medium">{client.address}</p>
              </div>
            )}

            <div>
              <span className="text-sm text-gray-600">Fecha de Registro</span>
              <p className="font-medium">{formatDate(client.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen Financiero</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Préstamos</span>
              <span className="text-lg font-semibold">{loans.length}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Prestado</span>
              <span className="text-lg font-semibold text-blue-600">
                {formatCurrency(totalLent)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pendiente por Cobrar</span>
              <span className="text-lg font-semibold text-yellow-600">
                {formatCurrency(totalPending)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Préstamos Activos</span>
              <span className="text-lg font-semibold text-green-600">
                {loans.filter(loan => loan.status === 'active').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loans List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Historial de Préstamos</h2>
        </div>

        {loans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Este cliente no tiene préstamos registrados</p>
            <Link to={`/loans/new?clientId=${client.id}`} className="btn-primary">
              Crear Primer Préstamo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Interés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cuotas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pendiente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(loan.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.interestRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.installments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(loan.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        loan.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : loan.status === 'paid'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {loan.status === 'active' ? 'Activo' : loan.status === 'paid' ? 'Pagado' : 'Vencido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loan.status === 'active' ? formatCurrency(loan.pendingAmount) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/loans/${loan.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <EyeIcon className="h-4 w-4 inline" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientDetail