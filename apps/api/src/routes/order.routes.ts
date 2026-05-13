import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Quote preview (Public or Authenticated)
router.post('/quote-preview', orderController.getQuotePreview);

// Quote submission (Authenticated)
router.post('/quote-request', authenticateJWT, orderController.submitQuoteRequest);

// Order creation from quote
router.post('/from-quote/:quoteId', authenticateJWT, orderController.createOrder);

// List all orders (Agent/Admin)
router.get('/', authenticateJWT, checkRole(['agent', 'admin']), orderController.getOrders);

// Status update (Agent/Admin)
router.patch('/:id/status', authenticateJWT, checkRole(['agent', 'admin']), orderController.updateOrderStatus);

// Public tracking
router.get('/tracking/:number', orderController.getTrackingDetails);

export default router;
