import "reflect-metadata";
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { AppDataSource } from './database/config';
import { OverdueJob } from './jobs/OverdueJob';

dotenv.config();

// Rutas
import clientRoutes from './routes/clientRoutes';
import loanRoutes from './routes/loanRoutes';
import summaryRoutes from './routes/summaryRoutes';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas del API
app.use('/api/clients', clientRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/summary', summaryRoutes);

// Servir aplicación frontend construida
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

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
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor backend ejecutándose en ${HOST}:${PORT}`);
      console.log(`📍 API URL: http://${HOST}:${PORT}/api`);
      console.log(`🏥 Health check: http://${HOST}:${PORT}/api/health`);
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