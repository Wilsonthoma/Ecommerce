import express from 'express';
import { protect, authorize, hasPermission } from '../../middleware/authMiddleware.js';
import { upload } from '../../utils/upload.js'; 

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

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin', 'editor'));

// --- Core Product Routes ---

/**
 * @route   POST /api/admin/products
 * @desc    Create new product (with file upload support)
 * @access  Private/Admin,Editor (requires write permission)
 */
router.post('/', 
  hasPermission('products', 'write'),
  upload.array('images', 4), // ADDED: Multer to handle up to 4 files in the 'images' field
  createProduct
);

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product (with file upload support)
 * @access  Private/Admin,Editor (requires write permission)
 */
router.put('/:id', 
  hasPermission('products', 'write'), 
  upload.array('images', 4), // ADDED: Multer to handle up to 4 files in the 'images' field
  updateProduct
);

// --- Bulk and Stats Routes ---
router.get('/', hasPermission('products', 'read'), getProducts);
router.get('/stats', hasPermission('products', 'read'), getProductStats);
router.put('/bulk', hasPermission('products', 'write'), bulkUpdateProducts);


// --- Single Product Routes ---
router.get('/:id', hasPermission('products', 'read'), getProduct);
router.delete('/:id', hasPermission('products', 'delete'), deleteProduct);


// --- Image & Inventory Routes ---

/**
 * @route   POST /api/admin/products/:id/images
 * @desc    Upload product images (Standalone for up to 10 images)
 * @access  Private/Admin,Editor (requires write permission)
 */
router.post('/:id/images', 
  hasPermission('products', 'write'),
  // NOTE: This specialized route keeps its own, higher limit if desired for batch uploads
  upload.array('images', 10), 
  uploadProductImages
);

router.delete('/:id/images/:imageIndex', 
  hasPermission('products', 'write'),
  deleteProductImage
);

router.put('/:id/images/:imageIndex/set-primary',
  hasPermission('products', 'write'),
  setPrimaryImage
);

router.put('/:id/inventory',
  hasPermission('products', 'write'),
  updateInventory
);

export default router;