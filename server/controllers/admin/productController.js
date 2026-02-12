import asyncHandler from 'express-async-handler';
import Product from '../../models/Product.js'; 
import Order from '../../models/Order.js';     
import { generateSKU } from '../../utils/helpers.js'; 

// --- Helper function for image URL (Must match your upload.js logic) ---
const getFileUrl = (filename) => `/uploads/products/${filename}`; 

// =========================================================================
//                  CORE CRUD CONTROLLERS (Provided Code)
// =========================================================================

/**
 * @desc    Create new product
 * @route   POST /api/admin/products
 * @access  Private/Admin,Editor
 */
export const createProduct = asyncHandler(async (req, res) => { 
  let productData = req.body; 
  const uploadedFiles = req.files; // Files from Multer

  // 1. Parse Dimensions (comes as JSON string from FormData)
  if (productData.dimensions && typeof productData.dimensions === 'string') {
    try {
      productData.dimensions = JSON.parse(productData.dimensions);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid dimensions data format.' });
    }
  }

  // 2. Process New Image Uploads
  if (uploadedFiles && uploadedFiles.length > 0) {
    const newImages = uploadedFiles.map((file, index) => ({
      url: getFileUrl(file.filename), 
      altText: productData.name,
      isPrimary: index === 0 
    }));
    productData.images = newImages; 
  }
  
  // 3. FIX: Map 'stock' (from frontend form) to 'quantity' (for Mongoose model)
  if (productData.stock !== undefined) {
      productData.quantity = productData.stock;
      delete productData.stock; 
  }
  
  // Generate SKU if not provided
  if (!productData.sku) {
    productData.sku = generateSKU(productData.name);
  }

  // Set published date if status is active
  if (productData.status === 'active' && !productData.publishedAt) {
    productData.publishedAt = new Date();
  }

  // Calculate total stock if has variants
  if (productData.hasVariants === true && productData.variants) {
    productData.quantity = productData.variants.reduce((total, variant) => total + (variant.quantity || 0), 0);
  }

  // Ensure tags is an array
  if (productData.tags && typeof productData.tags === 'string') {
    productData.tags = productData.tags.split(',').map(tag => tag.trim());
  }

  const product = await Product.create(productData); 

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

/**
 * @desc    Update product
 * @route   PUT /api/admin/products/:id
 * @access  Private/Admin,Editor
 */
export const updateProduct = asyncHandler(async (req, res) => { 
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  let updateData = req.body; 
  const uploadedFiles = req.files; 

  // 1. Parse Dimensions
  if (updateData.dimensions && typeof updateData.dimensions === 'string') {
    try {
      updateData.dimensions = JSON.parse(updateData.dimensions);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid dimensions data format.' });
    }
  }

  // 2. Process Images (Existing and New)
  if (uploadedFiles || updateData.existingImages) {
    let finalImages = [];
    
    // a. Collect Existing Images
    if (updateData.existingImages) {
      const existingUrls = Array.isArray(updateData.existingImages) 
        ? updateData.existingImages 
        : [updateData.existingImages];
        
      finalImages = product.images.filter(img => existingUrls.includes(img.url));
    }
    
    // b. Process New Image Uploads
    if (uploadedFiles && uploadedFiles.length > 0) {
      const newImages = uploadedFiles.map(file => ({
        url: getFileUrl(file.filename),
        altText: updateData.name || product.name,
        isPrimary: false 
      }));
      finalImages.push(...newImages);
    }
    
    // c. Apply Final Image Array and cleanup
    if (finalImages.length > 0) {
      if (!finalImages.some(img => img.isPrimary)) {
          finalImages[0].isPrimary = true;
      }
      updateData.images = finalImages;
    } else {
        updateData.images = [];
    }
    
    delete updateData.existingImages; 
  }

  // 3. FIX: Map 'stock' to 'quantity'
  if (updateData.stock !== undefined) {
      updateData.quantity = updateData.stock;
      delete updateData.stock; 
  }
  
  // Check SKU uniqueness
  if (updateData.sku && updateData.sku !== product.sku) {
    const existingProduct = await Product.findOne({ sku: updateData.sku });
    if (existingProduct && existingProduct._id.toString() !== product._id.toString()) {
      return res.status(400).json({ success: false, error: 'SKU already exists' });
    }
  }

  // Update published/archived dates
  if (product.status === 'draft' && updateData.status === 'active') {
    updateData.publishedAt = new Date();
  }
  if (updateData.status === 'archived' && product.status !== 'archived') {
    updateData.archivedAt = new Date();
  }
  
  // Handle variants update
  if (updateData.hasVariants === true && updateData.variants) {
    updateData.quantity = updateData.variants.reduce((total, variant) => total + (variant.quantity || 0), 0);
  }

  // Ensure tags is an array
  if (updateData.tags && typeof updateData.tags === 'string') {
    updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    updateData, 
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
});


// =========================================================================
//      MISSING EXPORTS (Function Stubs added to fix SyntaxError)
// =========================================================================

/**
 * @desc    Fetch all products (with optional filtering/pagination)
 * @route   GET /api/admin/products
 * @access  Private/Admin,Editor
 */
export const getProducts = asyncHandler(async (req, res) => {
    // Basic placeholder implementation:
    const products = await Product.find({})
      .select('-__v') // Exclude mongoose version key
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.status(200).json({ 
        success: true, 
        count: products.length, 
        data: products 
    });
});

/**
 * @desc    Fetch single product by ID
 * @route   GET /api/admin/products/:id
 * @access  Private/Admin,Editor
 */
export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).select('-__v');
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
});

/**
 * @desc    Delete product by ID
 * @route   DELETE /api/admin/products/:id
 * @access  Private/Admin,Editor
 */
export const deleteProduct = asyncHandler(async (req, res) => {
    // Find the product first to handle file deletion if necessary
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // TODO: Implement file deletion logic here using deleteFile utility

    await Product.deleteOne({ _id: req.params.id }); 
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

/**
 * @desc    Bulk update multiple products (e.g., status, price)
 * @route   PUT /api/admin/products/bulk
 * @access  Private/Admin,Editor
 */
export const bulkUpdateProducts = asyncHandler(async (req, res) => {
    const updates = req.body; 

    if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or empty list of bulk updates.' });
    }

    const operations = updates.map(item => {
      // Ensure we map 'stock' to 'quantity' if present in the bulk update item
      if (item.changes.stock !== undefined) {
          item.changes.quantity = item.changes.stock;
          delete item.changes.stock;
      }
      return {
        updateOne: {
            filter: { _id: item.id },
            update: { $set: item.changes },
            // $set operator is important for partial updates
        }
      }
    });

    const result = await Product.bulkWrite(operations);

    res.status(200).json({
        success: true,
        message: `${result.modifiedCount} products updated successfully`,
        data: result
    });
});

/**
 * @desc    Get product statistics (e.g., total sales, stock counts)
 * @route   GET /api/admin/products/stats
 * @access  Private/Admin,Editor
 */
export const getProductStats = asyncHandler(async (req, res) => {
    // Placeholder for Mongoose aggregation pipeline
    const stats = await Product.aggregate([
        {
            $group: {
                _id: '$category',
                totalStock: { $sum: '$quantity' },
                averagePrice: { $avg: '$price' },
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    res.status(200).json({ success: true, data: stats });
});

// --- Image & Inventory Management (Placeholder Stubs) ---

/**
 * @desc    Upload additional product images
 * @route   POST /api/admin/products/:id/images
 * @access  Private/Admin,Editor
 */
export const uploadProductImages = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: "Upload images endpoint working." });
});

/**
 * @desc    Delete a specific product image
 * @route   DELETE /api/admin/products/:id/images/:imageIndex
 * @access  Private/Admin,Editor
 */
export const deleteProductImage = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: "Delete image endpoint working." });
});

/**
 * @desc    Set a product image as primary
 * @route   PUT /api/admin/products/:id/images/:imageIndex/set-primary
 * @access  Private/Admin,Editor
 */
export const setPrimaryImage = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: "Set primary image endpoint working." });
});

/**
 * @desc    Update inventory stock level
 * @route   PUT /api/admin/products/:id/inventory
 * @access  Private/Admin,Editor
 */
export const updateInventory = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: "Update inventory endpoint working." });
});