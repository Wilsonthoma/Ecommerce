// server/routes/admin/productRoutes.js
import express from 'express';
import { protect, authorize, hasPermission } from '../../middleware/authMiddleware.js';
import { productUpload } from '../../utils/productUpload.js'; 

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  getProductStats,
  uploadProductImages,
  deleteProductImage,
  setPrimaryImage,
  updateInventory
} from '../../controllers/admin/productController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'editor'));

// --- Core Product Routes ---
router.post('/', 
  hasPermission('products', 'write'),
  // ✅ LIMIT INCREASED: Changed from 4 to 10 to accommodate frontend's MAX_IMAGES (6)
  productUpload.array('images', 10), 
  createProduct
);

router.put('/:id', 
  hasPermission('products', 'write'), 
  // ✅ LIMIT INCREASED: Changed from 4 to 10
  productUpload.array('images', 10), 
  updateProduct
);

// --- Stats and Bulk ---
router.get('/', hasPermission('products', 'read'), getProducts);
router.get('/stats', hasPermission('products', 'read'), getProductStats);
router.put('/bulk', hasPermission('products', 'write'), bulkUpdateProducts);

// --- Single Product ---
router.get('/:id', hasPermission('products', 'read'), getProduct);
router.delete('/:id', hasPermission('products', 'delete'), deleteProduct);

// --- Image Management ---
router.post('/:id/images', 
  hasPermission('products', 'write'),
  productUpload.array('images', 10), 
  uploadProductImages
);

export default router;