import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { testDatabaseConnection } from './config/db.js';
import healthRoutes from './routes/health.routes.js';
import workflowRoutes from './routes/workflow.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
}));
app.use(express.json());

app.use((req, res, next) => {
  const startedAt = Date.now();
  console.log(`[request] ${req.method} ${req.originalUrl} started`);

  res.on('finish', () => {
    console.log(`[request] ${req.method} ${req.originalUrl} ${res.statusCode} in ${Date.now() - startedAt}ms`);
  });

  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/workflows', workflowRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error('[server] unhandled error', err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

const server = app.listen(port, async () => {
  console.log(`OpsFlow backend running on port ${port}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);

  try {
    await testDatabaseConnection();
    console.log('[db] connection ok');
  } catch (error) {
    console.error('[db] connection failed', error);
  }
});

server.on('error', (error) => {
  console.error('[server] failed to start', error);
});
