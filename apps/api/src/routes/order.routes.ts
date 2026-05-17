import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Quote preview (Public or Authenticated)
router.post('/quote-preview', orderController.getQuotePreview);

// Quote submission (Authenticated)
router.post('/quote-request', authenticateJWT, orderController.submitQuoteRequest);

// Devis validation (QR Code target)
router.post('/validate/:id', authenticateJWT, orderController.validateQuote);
router.post('/reject/:id', authenticateJWT, orderController.rejectQuote);
router.post('/:id/submit-payment', authenticateJWT, orderController.submitOrderPayment);

// Order creation from quote (Admin/Agent)
router.post('/from-quote/:quoteId', authenticateJWT, orderController.createOrder);

// List all orders (Agent/Admin)
router.get('/', authenticateJWT, checkRole(['agent', 'admin']), orderController.getOrders);

// Status update (Agent/Admin)
router.patch('/:id/status', authenticateJWT, checkRole(['agent', 'admin']), orderController.updateOrderStatus);

// Delete order/receipt (Admin)
router.delete('/:id', authenticateJWT, checkRole(['admin']), orderController.deleteOrder);

// Public tracking
router.get('/tracking/:number', orderController.getTrackingDetails);

// Client Dashboard Endpoints
router.get('/client-quotes', authenticateJWT, orderController.getClientQuotes);
router.get('/client-orders', authenticateJWT, orderController.getClientOrders);
router.post('/quotes/:id/regenerate-pdf', authenticateJWT, orderController.regenerateQuotePdf);
router.get('/quotes/:id/download-pdf', authenticateJWT, orderController.downloadQuotePdf);
router.get('/receipts/:id/download-pdf', authenticateJWT, orderController.downloadReceiptPdf);

export default router;
