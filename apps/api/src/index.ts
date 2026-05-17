import './queues/pdf.queue';
import './queues/whatsapp.queue';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import adminRoutes from './routes/admin.routes';
import configRoutes from './routes/config.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : 'http://localhost:3000',
  credentials: true
}));
app.use(hpp()); // Prevent HTTP Parameter Pollution

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes effectuées depuis cette adresse IP, veuillez réessayer après 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Performance Middlewares
app.use(compression()); // Gzip compression
app.use(express.json({ 
  limit: '10kb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
})); // Limit body size
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/webhooks/whatsapp', whatsappRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/config', configRoutes);

// Error Handling
app.use(errorHandler);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Une erreur interne est survenue',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

import { startCleanupScheduler } from './services/cleanup.service';
import { initDb } from './lib/db';

startCleanupScheduler();
initDb();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
