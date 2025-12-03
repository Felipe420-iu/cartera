import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('🚀 Iniciando aplicación React...')

const root = ReactDOM.createRoot(document.getElementById('root')!)

console.log('✅ Root element encontrado')

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

console.log('✅ App renderizada exitosamente')