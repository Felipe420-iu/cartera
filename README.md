# 💰 Cartera Virtual - Sistema de Gestión de Préstamos

Una aplicación web completa para gestionar préstamos, clientes y cuotas con seguimiento automatizado de vencimientos y cálculo de moras.

## 🚀 Características

### 📊 Dashboard Completo
- Resumen financiero en tiempo real
- Métricas de préstamos activos, pagados y vencidos
- Visualización de próximos pagos
- Indicadores de rendimiento

### 👥 Gestión de Clientes
- CRUD completo de clientes
- Información de contacto y documentos
- Historial de préstamos por cliente
- Búsqueda y filtros avanzados

### 💳 Gestión de Préstamos
- Sistema francés de cuotas fijas
- Cálculo automático de intereses
- Cronograma detallado de pagos
- Estados: activo, pagado, vencido

### 🧮 Calculadora Integrada
- Simulación de préstamos en tiempo real
- Tabla de amortización completa
- Cálculo de rentabilidad
- Diferentes escenarios de plazo e interés

### 📅 Calendario de Pagos
- Visualización de todas las cuotas
- Identificación de cuotas: pendientes, vencidas, pagadas
- Gestión de pagos desde el calendario
- FullCalendar integrado

### ⚡ Automatización
- Cron job diario para cálculo de moras
- Actualización automática de estados
- Notificaciones de vencimientos
- Cálculo de intereses por mora

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** - Runtime de JavaScript
- **TypeScript** - Tipado estático
- **Express** - Framework web
- **TypeORM** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **node-cron** - Tareas programadas

### Frontend
- **React** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **TailwindCSS** - Framework CSS
- **FullCalendar** - Componente de calendario

### DevOps
- **Railway** - Plataforma de despliegue
- **VS Code** - Configuración completa
- **ESLint & Prettier** - Linting y formato

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd cartera
```

### 2. Configurar Backend

```bash
# Navegar al backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
nano .env
```

**Variables de entorno requeridas:**
```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_password
DATABASE_NAME=cartera_db
NODE_ENV=development

# Para Railway (Producción)
PGHOST=tu_host_railway
PGPORT=puerto_railway
PGUSER=usuario_railway
PGPASSWORD=password_railway
PGDATABASE=database_railway
```

### 3. Configurar Frontend

```bash
# Navegar al frontend
cd ../frontend

# Instalar dependencias
npm install

# (Opcional) Crear .env.local si necesitas configurar URL del API
echo "VITE_API_URL=http://localhost:3000" > .env.local
```

### 4. Configurar Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb cartera_db

# El esquema se creará automáticamente al iniciar el backend
```

## 🚀 Ejecución

### Desarrollo

**Opción 1: Usando VS Code (Recomendado)**
1. Abrir VS Code en la carpeta raíz
2. Presionar `Ctrl+Shift+P`
3. Ejecutar `Tasks: Run Task`
4. Seleccionar `Start Full Development`

**Opción 2: Terminal manual**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Acceder a la aplicación
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### Producción

```bash
# Construir backend
cd backend
npm run build

# Construir frontend
cd ../frontend
npm run build

# Iniciar backend en producción
cd ../backend
npm start
```

## 📁 Estructura del Proyecto

```
cartera/
├── backend/
│   ├── src/
│   │   ├── entities/          # Entidades TypeORM
│   │   ├── controllers/       # Controladores de rutas
│   │   ├── services/          # Lógica de negocio
│   │   ├── routes/            # Definición de rutas
│   │   ├── jobs/              # Tareas cron
│   │   ├── config/            # Configuración BD
│   │   └── app.ts             # Aplicación principal
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # Servicios API
│   │   ├── types/             # Tipos TypeScript
│   │   ├── utils/             # Utilidades
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── .vscode/
│   ├── tasks.json             # Tareas VS Code
│   ├── launch.json            # Configuración debug
│   └── cartera.code-workspace # Workspace
└── README.md
```

## 🔗 API Endpoints

### Clientes
```
GET    /api/clients           # Obtener todos los clientes
GET    /api/clients/:id       # Obtener cliente por ID
POST   /api/clients           # Crear nuevo cliente
PUT    /api/clients/:id       # Actualizar cliente
DELETE /api/clients/:id       # Eliminar cliente
```

### Préstamos
```
GET    /api/loans             # Obtener todos los préstamos
GET    /api/loans/:id         # Obtener préstamo por ID
GET    /api/loans/client/:id  # Obtener préstamos por cliente
POST   /api/loans             # Crear nuevo préstamo
POST   /api/loans/calculate   # Calcular préstamo (simulación)
PUT    /api/loans/installment/:id/pay  # Pagar cuota
```

### Resumen
```
GET    /api/summary           # Obtener resumen general
GET    /api/summary/calendar  # Obtener datos del calendario
```

### Utilidad
```
GET    /health                # Health check
```

## 🔧 Comandos Útiles

### Backend
```bash
# Desarrollo con auto-reload
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start

# Generar migración
npm run migration:generate -- -n NombreMigracion

# Ejecutar migraciones
npm run migration:run
```

### Frontend
```bash
# Desarrollo con hot reload
npm run dev

# Construir para producción
npm run build

# Preview de build
npm run preview

# Lint
npm run lint
```

## 🚂 Deploy en Railway

### 1. Preparación
1. Crear cuenta en [Railway](https://railway.app)
2. Conectar tu repositorio GitHub
3. Crear nuevo proyecto

### 2. Configurar Backend
1. Añadir servicio PostgreSQL en Railway
2. Configurar variables de entorno:
   ```
   PORT=3000
   NODE_ENV=production
   ```
3. Las variables de PostgreSQL se configuran automáticamente

### 3. Configurar Frontend
1. Crear nuevo servicio para frontend
2. Configurar build command:
   ```
   cd frontend && npm install && npm run build
   ```
3. Configurar start command:
   ```
   cd frontend && npx serve -s dist -l 5173
   ```

### 4. Variables de Entorno Railway

**Backend:**
- `PGHOST` - Automático
- `PGPORT` - Automático  
- `PGUSER` - Automático
- `PGPASSWORD` - Automático
- `PGDATABASE` - Automático
- `NODE_ENV=production`

**Frontend:**
- `VITE_API_URL` - URL del backend de Railway

## 📊 Fórmulas y Cálculos

### Sistema Francés
La aplicación utiliza el sistema francés para calcular cuotas fijas:

```
Cuota = Capital × [r(1+r)^n] / [(1+r)^n - 1]
```

Donde:
- `Capital` = Monto del préstamo
- `r` = Tasa de interés mensual (tasa_anual/12)
- `n` = Número de cuotas

### Interés por Mora
```
Interés_Mora = Monto_Cuota × Tasa_Diaria_Mora × Días_Retraso
```

Tasa diaria de mora por defecto: 0.1% diario

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte y preguntas:
- 📧 Email: tu-email@ejemplo.com
- 🐛 Issues: [GitHub Issues](link-to-issues)
- 📚 Documentación: [Wiki del proyecto](link-to-wiki)

---

**¡Disfruta gestionando tu cartera de préstamos! 🎉**