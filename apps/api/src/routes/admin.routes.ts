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
router.post('/quotes/special', adminController.createSpecialQuote);
router.get('/agents', adminController.getAgents);
router.post('/agents', adminController.createAgent);
router.put('/agents/:id', adminController.updateAgent);
router.delete('/agents/:id', adminController.deleteAgent);
router.get('/clients', adminController.getClients);
router.put('/clients/:id', adminController.updateClient);
router.delete('/clients/:id', adminController.deleteClient);

export default router;
