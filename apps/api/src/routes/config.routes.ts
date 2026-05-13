import { Router } from 'express';
import { getConfig, updateConfig, uploadLogo } from '../controllers/config.controller';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware';
import { upload } from '../services/upload.service';

const router = Router();

router.get('/', getConfig);
router.put('/', authenticateJWT, checkRole(['admin']), updateConfig);
router.post('/logo', authenticateJWT, checkRole(['admin']), upload.single('logo'), uploadLogo);

export default router;
