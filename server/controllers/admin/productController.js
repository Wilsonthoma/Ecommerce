import asyncHandler from 'express-async-handler';
import Product from '../../models/Product.js'; 
import Order from '../../models/Order.js';     
import { generateSKU } from '../../utils/helpers.js'; 
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// --- Configure multer for file uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/products/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// --- Helper function for image URL ---
const getFileUrl = (filename) => `/uploads/products/${filename}`; 

// =========================================================================
//                  CORE CRUD CONTROLLERS
// =========================================================================

/**
 * @desc    Create new product
 * @route   POST /api/admin/products
 * @access  Private/Admin,Editor
 */
export const createProduct = asyncHandler(async (req, res) => { 
  let productData = req.body; 
  const uploadedFiles = req.files; // Files from Multer - expects field name 'images'

  console.log('📦 Creating product with data:', productData);
  console.log('📸 Uploaded files:', uploadedFiles?.map(f => f.filename));

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
  
  // Set default values for product visibility
  productData.inStock = true;           // THIS ENABLES THE BUY BUTTONS!
  productData.status = 'active';        // Product is active
  productData.isPublished = true;       // Product is published
  productData.isActive = true;         // Product is active
  
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
  const uploadedFiles = req.files; // Files from Multer - expects field name 'images'

  console.log('📦 Updating product with data:', updateData);
  console.log('📸 Uploaded files:', uploadedFiles?.map(f => f.filename));

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
  
  // Ensure these fields are properly set
  if (updateData.inStock === undefined) {
    updateData.inStock = true; // Default to true if not specified
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
//      PRODUCT CRUD OPERATIONS
// =========================================================================

/**
 * @desc    Fetch all products (with optional filtering/pagination)
 * @route   GET /api/admin/products
 * @access  Private/Admin,Editor
 */
export const getProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, category, status, sort = '-createdAt' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (status) query.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort)
        .select('-__v')
        .lean(),
      Product.countDocuments(query)
    ]);
    
    res.status(200).json({ 
        success: true, 
        count: products.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: products 
    });
});

/**
 * @desc    Fetch single product by ID
 * @route   GET /api/admin/products/:id
 * @access  Private/Admin,Editor
 */
export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).select('-__v').lean();
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
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }

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
      if (item.changes.stock !== undefined) {
          item.changes.quantity = item.changes.stock;
          delete item.changes.stock;
      }
      return {
        updateOne: {
            filter: { _id: item.id },
            update: { $set: item.changes },
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
 * @desc    Get product statistics
 * @route   GET /api/admin/products/stats
 * @access  Private/Admin,Editor
 */
export const getProductStats = asyncHandler(async (req, res) => {
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

    const totalProducts = await Product.countDocuments();
    const totalStock = await Product.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    res.status(200).json({ 
      success: true, 
      data: {
        byCategory: stats,
        totalProducts,
        totalStock: totalStock[0]?.total || 0,
        outOfStock: await Product.countDocuments({ quantity: { $lte: 0 } }),
        lowStock: await Product.countDocuments({ quantity: { $gt: 0, $lte: 10 } })
      } 
    });
});

// --- Image & Inventory Management ---

/**
 * @desc    Upload additional product images
 * @route   POST /api/admin/products/:id/images
 * @access  Private/Admin,Editor
 */
export const uploadProductImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const uploadedFiles = req.files;
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, error: 'No images uploaded' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    const newImages = uploadedFiles.map(file => ({
      url: getFileUrl(file.filename),
      altText: product.name,
      isPrimary: product.images.length === 0 // Set as primary if no images exist
    }));
    
    product.images.push(...newImages);
    await product.save();
    
    res.status(200).json({ 
      success: true, 
      message: `${newImages.length} images uploaded successfully`,
      data: product.images 
    });
});

/**
 * @desc    Delete a specific product image
 * @route   DELETE /api/admin/products/:id/images/:imageIndex
 * @access  Private/Admin,Editor
 */
export const deleteProductImage = asyncHandler(async (req, res) => {
    const { id, imageIndex } = req.params;
    const index = parseInt(imageIndex);
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    if (index < 0 || index >= product.images.length) {
      return res.status(400).json({ success: false, error: 'Invalid image index' });
    }
    
    product.images.splice(index, 1);
    
    // If we removed the primary image and there are other images, set the first as primary
    if (product.images.length > 0 && !product.images.some(img => img.isPrimary)) {
      product.images[0].isPrimary = true;
    }
    
    await product.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Image deleted successfully',
      data: product.images 
    });
});

/**
 * @desc    Set a product image as primary
 * @route   PUT /api/admin/products/:id/images/:imageIndex/set-primary
 * @access  Private/Admin,Editor
 */
export const setPrimaryImage = asyncHandler(async (req, res) => {
    const { id, imageIndex } = req.params;
    const index = parseInt(imageIndex);
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    if (index < 0 || index >= product.images.length) {
      return res.status(400).json({ success: false, error: 'Invalid image index' });
    }
    
    // Set all images isPrimary to false, then set the selected one to true
    product.images.forEach((img, i) => {
      img.isPrimary = i === index;
    });
    
    await product.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Primary image set successfully',
      data: product.images 
    });
});

/**
 * @desc    Update inventory stock level
 * @route   PUT /api/admin/products/:id/inventory
 * @access  Private/Admin,Editor
 */
export const updateInventory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity, adjustBy } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    if (adjustBy) {
      product.quantity += adjustBy;
    } else if (quantity !== undefined) {
      product.quantity = quantity;
    }
    
    // Update inStock based on quantity
    product.inStock = product.quantity > 0;
    
    await product.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Inventory updated successfully',
      data: { quantity: product.quantity, inStock: product.inStock }
    });
});