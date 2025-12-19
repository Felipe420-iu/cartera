import React, { useEffect, useState } from 'react';
import { User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';

interface Client {
  id?: number;
  name: string;
  lastName: string;
  documentId: string;
  phone?: string;
  email?: string;
  address?: string;
  active?: boolean;
}

interface LocalLoan {
  id: number;
  clientId: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    documentId: '',
    phone: '',
    email: '',
    address: '',
    active: true
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalClient, setModalClient] = useState<Client | null>(null);

  // Cargar clientes guardados (localStorage) al montar
  useEffect(() => {
    const stored = localStorage.getItem('clients');
    if (stored) {
      try {
        const parsed: Client[] = JSON.parse(stored);
        const normalized = parsed.map(c => ({ ...c, active: c.active ?? true }));
        setClients(normalized);
      } catch (err) {
        console.error('No se pudieron leer los clientes guardados', err);
      }
    }
    setHasLoaded(true);
  }, []);

  // Guardar cambios en clientes para persistir tras recarga
  useEffect(() => {
    if (!hasLoaded) return; // evitar sobrescribir antes de cargar
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients, hasLoaded]);

  // Simular conexión con backend - más tarde conectaremos al API real
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.name.trim() || !formData.lastName.trim() || !formData.documentId.trim()) {
        throw new Error('Nombre, apellido y documento son obligatorios');
      }

      const duplicate = clients.some(c => c.documentId === formData.documentId && c.id !== editingId);
      if (duplicate) {
        throw new Error('Ya existe un cliente con este documento');
      }

      if (editingId) {
        setClients(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } : c));
        setSuccess('Cliente actualizado exitosamente');
      } else {
        const newClient: Client = { id: Date.now(), ...formData, active: true };
        setClients(prev => [newClient, ...prev]);
        setSuccess('Cliente creado exitosamente');
      }

      setFormData({
        name: '',
        lastName: '',
        documentId: '',
        phone: '',
        email: '',
        address: '',
        active: true
      });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startEdit = (client: Client) => {
    setFormData({
      name: client.name,
      lastName: client.lastName,
      documentId: client.documentId,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      active: client.active ?? true
    });
    setEditingId(client.id || null);
    setShowForm(true);
  };

  const clearLoansForClient = (clientId: number) => {
    const stored = localStorage.getItem('loans');
    if (!stored) return;
    try {
      const loans: LocalLoan[] = JSON.parse(stored);
      const filtered = loans.filter(l => l.clientId !== clientId);
      localStorage.setItem('loans', JSON.stringify(filtered));
    } catch (err) {
      console.error('No se pudieron limpiar los préstamos del cliente', err);
    }
  };

  const toggleActive = (client: Client) => {
    if (!client.id) return;
    const nextActive = !(client.active ?? true);
    if (!nextActive) {
      setModalClient(client);
      return;
    }
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, active: nextActive } : c));
  };

  const inactivateClient = (client: Client) => {
    if (!client.id) return;
    clearLoansForClient(client.id);
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, active: false } : c));
    setModalClient(null);
  };

  const deleteClient = (client: Client) => {
    if (!client.id) return;
    clearLoansForClient(client.id);
    setClients(prev => prev.filter(c => c.id !== client.id));
    setModalClient(null);
  };

  const goToLoans = (client: Client) => {
    if (!(client.active ?? true)) return;
    window.location.href = '/loans';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra la información de tus clientes para la cartera gota a gota</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', lastName: '', documentId: '', phone: '', email: '', address: '', active: true });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <User className="w-5 h-5" />
          {showForm ? 'Cancelar' : 'Nuevo Cliente'}
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el nombre"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el apellido"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento de Identidad *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="documentId"
                  value={formData.documentId}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cédula o documento"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Número de teléfono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dirección completa del cliente"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    {editingId ? 'Guardar cambios' : 'Crear Cliente'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', lastName: '', documentId: '', phone: '', email: '', address: '', active: true });
                  setShowForm(false);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Clientes */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Clientes Registrados ({clients.length})
          </h3>
        </div>
        
        {clients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay clientes registrados aún</p>
            <p className="text-sm">Haz clic en "Nuevo Cliente" para agregar el primero</p>
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
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {client.name.charAt(0)}{client.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.name} {client.lastName}
                          </div>
                          {client.address && (
                            <div className="text-sm text-gray-500">{client.address}</div>
                          )}
                          <div className={`text-xs font-semibold ${client.active === false ? 'text-red-600' : 'text-green-600'}`}>
                            {client.active === false ? 'Inactivo' : 'Activo'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.documentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {client.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {client.phone}
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center mt-1">
                            <Mail className="w-4 h-4 mr-1" />
                            {client.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button className="text-blue-600 hover:text-blue-900" onClick={() => startEdit(client)}>
                        Editar
                      </button>
                      <button
                        className={`text-green-600 hover:text-green-900 ${client.active === false ? 'opacity-40 cursor-not-allowed' : ''}`}
                        onClick={() => goToLoans(client)}
                        disabled={client.active === false}
                        title={client.active === false ? 'Cliente inactivo. Actívalo para crear préstamos.' : ''}
                      >
                        Préstamo
                      </button>
                      <button
                        className="text-orange-600 hover:text-orange-800"
                        onClick={() => toggleActive(client)}
                      >
                        {client.active === false ? 'Activar' : 'Inactivar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalClient && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">¿Qué deseas hacer con este cliente?</h3>
            <p className="text-sm text-gray-600">{modalClient.name} {modalClient.lastName}</p>
            <p className="text-xs text-gray-500">Si eliminas, borrarás también su historial de préstamos almacenado.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="btn-primary flex-1"
                onClick={() => inactivateClient(modalClient)}
              >
                Inactivar
              </button>
              <button
                className="btn-secondary flex-1"
                onClick={() => deleteClient(modalClient)}
              >
                Eliminar
              </button>
            </div>
            <button
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setModalClient(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}