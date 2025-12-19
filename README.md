# 💰 Sistema de Cartera de Préstamos

Sistema completo para la gestión de cartera de préstamos con frontend React y backend Node.js.

## 🚀 Características

- ✅ Gestión de clientes
- ✅ Sistema de préstamos con amortización francesa
- ✅ Calculadora de préstamos
- ✅ Seguimiento de pagos
- ✅ Calendario de vencimientos
- ✅ Intereses por mora automáticos
- ✅ Dashboard con estadísticas

## 🛠️ Tecnologías

**Backend:**
- Node.js + TypeScript
- Express.js
- TypeORM + SQLite
- Cron jobs para tareas programadas

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS
- React Router
- Axios

## 🏃‍♂️ Instalación y Ejecución

1. **Instalar dependencias:**
```bash
npm install
```

2. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

Esto iniciará:
- Backend en http://localhost:3000
- Frontend en http://localhost:5173

## 📊 Uso

1. **Accede al frontend:** http://localhost:5173
2. **API del backend:** http://localhost:3000/api
3. **Health check:** http://localhost:3000/api/health

## 🗂️ Estructura del Proyecto

```
cartera/
├── src/
│   ├── controllers/     # Controladores del API
│   ├── entities/        # Entidades de la base de datos
│   ├── services/        # Lógica de negocio
│   ├── routes/          # Rutas del API
│   ├── jobs/            # Tareas programadas
│   ├── database/        # Configuración de la BD
│   ├── components/      # Componentes React
│   ├── pages/           # Páginas React
│   ├── types/           # Tipos TypeScript
│   └── services/        # Servicios del frontend
├── public/              # Archivos estáticos
└── package.json
```

## 🔗 Endpoints del API

**Clientes:**
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `GET /api/clients/:id` - Obtener cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

**Préstamos:**
- `GET /api/loans` - Listar préstamos
- `POST /api/loans` - Crear préstamo
- `POST /api/loans/calculate` - Calcular préstamo
- `PUT /api/loans/:loanId/installments/:installmentId/pay` - Pagar cuota

**Resumen:**
- `GET /api/summary` - Resumen general
- `GET /api/summary/calendar` - Datos del calendario

## 📝 Scripts Disponibles

- `npm run dev` - Ejecutar ambos servidores en desarrollo
- `npm run dev:backend` - Solo el backend
- `npm run dev:frontend` - Solo el frontend  
- `npm run build` - Construir para producción
- `npm start` - Ejecutar en producción

## 📄 Licencia

Este proyecto es de uso libre para fines educativos y comerciales.