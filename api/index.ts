import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './backend/src/config/database';

// Rutas
import clientRoutes from './backend/src/routes/clientRoutes';
import loanRoutes from './backend/src/routes/loanRoutes';
import summaryRoutes from './backend/src/routes/summaryRoutes';

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar base de datos
let isDbInitialized = false;

const initializeDb = async () => {
  if (!isDbInitialized) {
    try {
      await AppDataSource.initialize();
      isDbInitialized = true;
      console.log('✅ Base de datos conectada');
    } catch (error) {
      console.error('❌ Error conectando base de datos:', error);
    }
  }
};

// Middleware para asegurar que la DB esté inicializada
app.use(async (req, res, next) => {
  await initializeDb();
  next();
});

// Rutas
app.use('/api/clients', clientRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/summary', summaryRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta principal del API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API de Cartera de Préstamos',
    version: '1.0.0',
    endpoints: {
      clients: '/api/clients',
      loans: '/api/loans',
      summary: '/api/summary',
      health: '/api/health'
    }
  });
});

export default app;