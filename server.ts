import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db';
import { errorHandler } from './middleware/errorHandler';
import { loggingMiddleware } from './middleware/logging';

// Routers
import authRouter from './routes/auth.routes';
import militaresRouter from './routes/militares.routes';
import divisRouter from './routes/civis.routes';
import turnosRouter from './routes/turnos.routes';
import dashboardRouter from './routes/dashboard.routes';
import adminRouter from './routes/admin.routes';
import ubmRouter from './routes/ubm.routes';
import logsRouter from './routes/logs.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware); // Middleware de logging automático

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/militares', militaresRouter);
app.use('/api/civis', divisRouter);
app.use('/api/turnos', turnosRouter);
app.use('/api/ubms', ubmRouter);
app.use('/api/logs', logsRouter);
app.use('/api', turnosRouter);      // turnos, chamadas, equipes (paths já incluem /turnos etc.)
app.use('/api', dashboardRouter);   // dashboard, vw/*, sp/*, database-objects
app.use('/api', adminRouter);       // users, atestados, logs, debug

// ── Global error handler (deve ser o ÚLTIMO middleware) ─────────────────────
app.use(errorHandler);

// ── Start server ────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 API disponível em http://192.168.88.2:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
