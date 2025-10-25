// Global Imports
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import http from 'http';
import helmet from 'helmet';
import morgan from 'morgan';
import cron from 'node-cron';
import express from 'express';
import mongoose from 'mongoose';
import timeout from 'connect-timeout';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import { Request, Response, NextFunction } from 'express';

// Local Imports
import './extension';
import Env from './constant/env';
import applyRoutes from './routes';
import AppError from './utils/appError';
import SystemMonitor from './utils/systemMonitor';
import haltOnTimedout from './utils/haltOnTimedout';
import { permissionsPolicy } from './utils/securityHeaders';
import { gracefulShutdown } from './utils/gracefullShutdown';
import globalErrorHandler from './controllers/error.controller';
import { buildWeeklyReport } from './jobs/download.weekly.report';
import { generateDailyResourceAllocationReport } from './jobs/daily.resource.allocation.report';
import { updatePatientAdmissionHistoryStatus } from './jobs/update.patient.admission.history.status';

// Config ENV
const envValidationStatus = Env.validateEnv();
if (envValidationStatus != null) {
  console.log(envValidationStatus);
  process.exit(0);
}

const app = express();
const host = Env.SERVER_IP || '127.0.0.1';
const port = Number(Env.SERVER_PORT) || 3000;

mongoose
  .connect(Env.DATABASE_URL as string, { autoIndex: true })
  .then(() => console.log('DB connections succesfull'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.set('trust proxy', 1);

// CORS setup
const corsOptions = {
  origin: Env.NODE_ENV === 'development' ? '*' : Env.CORS_ORIGIN,
};
app.use(cors(corsOptions));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTPS headers
app.use(helmet());
app.use(permissionsPolicy);

// Body parsser, reading data from body into req.body
app.use(express.json({ limit: '4096kb' }));
app.use(express.urlencoded({ extended: true, limit: '4096kb' }));

// Compression
app.use(compression());

// Request timeout
app.use(timeout('20s'));
app.use(haltOnTimedout);

// Logging
const monitor = new SystemMonitor(60000);
app.use(morgan('dev'));
monitor.start();

// Sanitize Middleware
app.use((req, res, next) => {
  /**
   * INFO:
   * Temporary workaround for Express 5's immutable query.
   * mongo-sanitize isn't updated yet — remove this once it's compatible.
   */
  const originalQuery = req.query;
  Object.defineProperty(req, 'query', {
    value: { ...originalQuery },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
app.use(mongoSanitize());

// Routers
applyRoutes(app);

// Handling unexpected routes
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 500));
});

// Centralized error handling
app.use(globalErrorHandler);

// CRON jobs
cron.schedule('*/5 * * * *', () => {
  console.log('Running job every five minute');
  updatePatientAdmissionHistoryStatus();
});

cron.schedule('55 23 * * *', () => {
  console.log('Running job daily at 11:55 PM');
  generateDailyResourceAllocationReport();
});

cron.schedule('30 0 * * 0', () => {
  console.log('Running job every Sunday at 12:30 AM');
  buildWeeklyReport();
});

// Create HTTP server
const server = http.createServer(app);

// Anti-Slowloris: Set Timeouts
server.keepAliveTimeout = 5000; // 5 seconds
server.headersTimeout = 65000; // 65 seconds (must be > keepAliveTimeout)

server.listen(port, host, () => {
  console.log(`Server started on ${host}:${port}`);
});

// Graceful shutdown handlers
['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(server, signal));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown(server, 'unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown(server, 'uncaughtException');
});
