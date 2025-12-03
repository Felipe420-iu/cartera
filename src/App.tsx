import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-8">💰</h1>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Cartera Virtual
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Gestión de Préstamos y Pagos
        </p>
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>✅ React funcionando correctamente</strong>
          </div>
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <strong>🚀 Frontend iniciado en puerto 5173</strong>
          </div>
          <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded">
            <strong>⚡ Vite corriendo exitosamente</strong>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-gray-500">
            Si ves este mensaje, significa que la aplicación React está funcionando correctamente.
          </p>
        </div>
        <div className="mt-6 text-sm text-gray-400">
          Hora actual: {new Date().toLocaleTimeString('es-CO')}
        </div>
      </div>
    </div>
  )
}

export default App

export default App