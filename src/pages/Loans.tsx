import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, EyeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { loanService } from '../services/loanService'
import { clientService } from '../services/clientService'
import { Loan, Client, CreateLoanRequest } from '../types'
import { formatCurrency, formatDate } from '../utils/format'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import LoanModal from '../components/LoanModal'

const Loans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [loansData, clientsData] = await Promise.all([
        loanService.getAll(),
        clientService.getAll()
      ])
      
      setLoans(loansData)
      setClients(clientsData)
    } catch (error: any) {
      toast.error('Error al cargar datos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLoan = async (loanData: CreateLoanRequest) => {
    try {
      await loanService.create(loanData)
      toast.success('Préstamo creado exitosamente')
      setModalOpen(false)
      await loadData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.client?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.client?.documentId?.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalStats = {
    totalLent: loans.reduce((sum, loan) => sum + Number(loan.amount), 0),
    totalPending: loans
      .filter(loan => loan.status === 'active')
      .reduce((sum, loan) => sum + loan.pendingAmount, 0),
    activeLoans: loans.filter(loan => loan.status === 'active').length,
    paidLoans: loans.filter(loan => loan.status === 'paid').length,
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-gray-600">Gestiona todos los préstamos</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Préstamo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{totalStats.activeLoans}</div>
          <div className="text-gray-600">Préstamos Activos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{totalStats.paidLoans}</div>
          <div className="text-gray-600">Préstamos Pagados</div>
        </div>
        <div className="card text-center">
          <div className="text-lg font-bold text-purple-600">{formatCurrency(totalStats.totalLent)}</div>
          <div className="text-gray-600">Total Prestado</div>
        </div>
        <div className="card text-center">
          <div className="text-lg font-bold text-yellow-600">{formatCurrency(totalStats.totalPending)}</div>
          <div className="text-gray-600">Total Pendiente</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por cliente o documento..."
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="paid">Pagados</option>
              <option value="defaulted">Vencidos</option>
            </select>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            {filteredLoans.length} préstamo(s) encontrado(s)
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="card overflow-hidden">
        {filteredLoans.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg mb-4">No se encontraron préstamos</p>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              Crear Primer Préstamo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
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
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {loan.client?.fullName || 'Cliente eliminado'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {loan.client?.documentId}
                        </div>
                      </div>
                    </td>
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
                      {loan.status === 'active' ? (
                        <span className={loan.overdueInstallments > 0 ? 'text-red-600 font-semibold' : ''}>
                          {formatCurrency(loan.pendingAmount)}
                          {loan.overdueInstallments > 0 && (
                            <span className="block text-xs">
                              ({loan.overdueInstallments} cuotas vencidas)
                            </span>
                          )}
                        </span>
                      ) : '-'}
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

      {/* Loan Modal */}
      {modalOpen && (
        <LoanModal
          clients={clients}
          onSave={handleCreateLoan}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

export default Loans