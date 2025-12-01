import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { OverdueJob } from './jobs/OverdueJob';

// Rutas
import clientRoutes from './routes/clientRoutes';
import loanRoutes from './routes/loanRoutes';
import summaryRoutes from './routes/summaryRoutes';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/clients', clientRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/summary', summaryRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Cartera de Préstamos',
    version: '1.0.0',
    endpoints: {
      clients: '/api/clients',
      loans: '/api/loans',
      summary: '/api/summary',
      health: '/health'
    }
  });
});

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Inicializar aplicación
async function startServer() {
  try {
    // Inicializar base de datos
    console.log('🔗 Conectando a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada exitosamente');

    // Inicializar cron job para cuotas vencidas
    console.log('⏰ Inicializando trabajos programados...');
    const overdueJob = new OverdueJob();
    overdueJob.start();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('🔌 Conexión a base de datos cerrada');
  }
  
  console.log('👋 Servidor cerrado exitosamente');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Cerrando servidor...');
  
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('🔌 Conexión a base de datos cerrada');
  }
  
  console.log('👋 Servidor cerrado exitosamente');
  process.exit(0);
});

// Iniciar aplicación
startServer();