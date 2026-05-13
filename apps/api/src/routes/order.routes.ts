import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Quote preview (Public or Authenticated)
router.post('/quote-preview', orderController.getQuotePreview);

// Quote submission (Authenticated)
router.post('/quote-request', authenticateJWT, orderController.submitQuoteRequest);

export default router;
