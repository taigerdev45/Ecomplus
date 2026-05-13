import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
