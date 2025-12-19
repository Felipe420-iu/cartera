import React from 'react'

const Clients: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button className="btn-primary">
          Nuevo Cliente
        </button>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <p className="text-gray-500">Funcionalidad de clientes en desarrollo...</p>
        </div>
      </div>
    </div>
  )
}

export default Clients