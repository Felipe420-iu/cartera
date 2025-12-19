import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './database/config';
import { OverdueJob } from './jobs/OverdueJob';

// Rutas
import clientRoutes from './routes/clientRoutes';
import loanRoutes from './routes/loanRoutes';
import summaryRoutes from './routes/summaryRoutes';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas del API
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
    message: '💰 API de Cartera de Préstamos',
    version: '1.0.0',
    endpoints: {
      clients: '/api/clients',
      loans: '/api/loans',
      summary: '/api/summary',
      health: '/api/health'
    }
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
      console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
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

// Iniciar aplicación
startServer();