import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware';
import { upload } from '../services/upload.service';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/rate', productController.getExchangeRate);
router.get('/settings', productController.getPublicSettings);
router.get('/:id', productController.getProductById);

// Admin routes
router.post(
  '/',
  authenticateJWT,
  checkRole(['admin']),
  upload.array('images', 5),
  productController.createProduct
);

router.put(
  '/:id',
  authenticateJWT,
  checkRole(['admin']),
  upload.array('images', 5),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticateJWT,
  checkRole(['admin']),
  productController.deleteProduct
);

export default router;
