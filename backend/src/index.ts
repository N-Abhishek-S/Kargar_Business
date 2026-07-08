import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = [resolve(process.cwd(), '.env'), resolve(process.cwd(), 'backend/.env')].find(existsSync);
dotenv.config(envPath ? { path: envPath } : undefined);

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { publicRoutes } from './routes/public.routes.js';
import { contactRoutes } from './routes/contact.routes.js';
import { reviewRoutes } from './routes/review.routes.js';
import { newsletterRoutes } from './routes/newsletter.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware.js';

const app = express();

const apiStatus = {
  success: true,
  message: 'Kargar FM API is running',
};

// ============================================
// MIDDLEWARE STACK
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", env.FRONTEND_URL],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS — only allow frontend origin
app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: { write: (message: string) => logger.http(message.trim()) },
}));

// Global rate limiter
app.use(globalRateLimiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', (_req, res) => {
  res.json(apiStatus);
});

app.get('/', (_req, res) => {
  res.json(apiStatus);
});

app.get('/api', (_req, res) => {
  res.json({
    ...apiStatus,
    endpoints: [
      '/api/health',
      '/api/services',
      '/api/client-logos',
      '/api/faq',
      '/api/stats',
      '/api/contact',
      '/api/reviews',
      '/api/newsletter',
      '/api/admin',
    ],
  });
});

// Public routes
app.use('/api', publicRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

if (!process.env.VERCEL && env.NODE_ENV !== 'test') {
  const PORT = env.PORT;
  app.listen(PORT, () => {
    logger.info(`🚀 Kargar FM API running on port ${PORT}`);
    logger.info(`📍 Environment: ${env.NODE_ENV}`);
    logger.info(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
  });
}

export default app;
export { app };
