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
import chatRoutes from './routes/chat.routes';
import notificationRoutes from './routes/notification.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const ALLOWED_ORIGINS = [
  'https://ecomplus-web.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : []),
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, mobile, Postman…)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Allow any vercel.app preview deployment of the project
    if (/^https:\/\/ecomplus-.*\.vercel\.app$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Handle preflight for ALL routes explicitly
app.options('*', cors(corsOptions));
app.use(hpp()); // Prevent HTTP Parameter Pollution

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000, // Increase threshold to 3000 to accommodate frequent chat and visit pollings
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
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/notifications', notificationRoutes);

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
