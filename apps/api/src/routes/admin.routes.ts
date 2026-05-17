import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// All admin routes are protected
router.use(authenticateJWT);
router.use(checkRole(['admin']));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/reports-stats', adminController.getReportsStats);
router.get('/quotes', adminController.getAllQuotes);
router.get('/agents', adminController.getAgents);
router.post('/agents', adminController.createAgent);

export default router;
