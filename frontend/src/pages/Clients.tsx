import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { clientService } from '../services/clientService'
import { Client, CreateClientRequest } from '../types'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import ClientModal from '../components/ClientModal'

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await clientService.getAll()
      setClients(data)
    } catch (error: any) {
      toast.error('Error al cargar clientes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveClient = async (clientData: CreateClientRequest) => {
    try {
      if (editingClient) {
        await clientService.update(editingClient.id, clientData)
        toast.success('Cliente actualizado exitosamente')
      } else {
        await clientService.create(clientData)
        toast.success('Cliente creado exitosamente')
      }
      
      setModalOpen(false)
      setEditingClient(null)
      await loadClients()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDeleteClient = async (clientId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return
    }

    try {
      await clientService.delete(clientId)
      toast.success('Cliente eliminado exitosamente')
      await loadClients()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const openEditModal = (client: Client) => {
    setEditingClient(client)
    setModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingClient(null)
    setModalOpen(true)
  }

  const filteredClients = clients.filter(client => 
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.documentId.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gestiona tu base de clientes</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, documento o email..."
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredClients.length} cliente(s) encontrado(s)
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="card overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron clientes</p>
            <button onClick={openCreateModal} className="btn-primary mt-4">
              Crear primer cliente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Préstamos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {client.fullName}
                        </div>
                        {client.address && (
                          <div className="text-sm text-gray-500">{client.address}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.documentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {client.phone && <div>{client.phone}</div>}
                        {client.email && <div>{client.email}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.loans?.length || 0} préstamo(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/clients/${client.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <EyeIcon className="h-4 w-4 inline" />
                      </Link>
                      <button
                        onClick={() => openEditModal(client)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <PencilIcon className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Modal */}
      {modalOpen && (
        <ClientModal
          client={editingClient}
          onSave={handleSaveClient}
          onClose={() => {
            setModalOpen(false)
            setEditingClient(null)
          }}
        />
      )}
    </div>
  )
}

export default Clients