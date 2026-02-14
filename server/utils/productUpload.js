// server/utils/productUpload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory for products
const createProductsUploadDir = () => {
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'products');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Created products upload directory: ${uploadDir}`);
  } else {
    console.log(`📁 Products upload directory exists: ${uploadDir}`);
  }
  
  // Check if writable
  try {
    fs.accessSync(uploadDir, fs.constants.W_OK);
    console.log(`✅ Products upload directory is writable`);
  } catch (err) {
    console.error(`❌ Products upload directory is NOT writable:`, err);
    try {
      fs.chmodSync(uploadDir, 0o755);
      console.log(`✅ Fixed permissions for products upload directory`);
    } catch (chmodErr) {
      console.error(`❌ Could not fix permissions:`, chmodErr);
    }
  }
  
  return uploadDir;
};

// Product image storage configuration
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = createProductsUploadDir();
    console.log(`📁 Product image destination: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const sanitizedName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .slice(0, 30);
    
    const filename = `product-${sanitizedName}-${timestamp}-${uniqueId.slice(0, 8)}${ext}`;
    console.log(`📸 Saving product image as: ${filename}`);
    cb(null, filename);
  }
});

// File filter for product images
const productFileFilter = (req, file, cb) => {
  console.log(`🔍 Checking product image: ${file.originalname}, MIME: ${file.mimetype}`);
  
  const allowedMimes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    console.log('✅ Product image accepted');
    cb(null, true);
  } else {
    console.log('❌ Product image rejected:', file.mimetype);
    cb(new Error('Only JPG, PNG, GIF, and WEBP images are allowed for products!'), false);
  }
};

// ✅ EXPORT THE MULTER INSTANCE DIRECTLY as a named export
export const productUpload = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for product images
    files: 10 // Max 10 files per upload
  },
  fileFilter: productFileFilter
});

console.log('✅ Product upload multer initialized successfully');

// Helper function to get product image URL
export const getProductImageUrl = (filename) => {
  if (!filename) return null;
  return `/uploads/products/${filename}`;
};

// Helper function to delete product image
export const deleteProductImage = (filename) => {
  try {
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'products', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted product image: ${filename}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error deleting product image:', error);
    return false;
  }
};

// Optional: export a default object if needed for collections
export default {
  productUpload,
  getProductImageUrl,
  deleteProductImage
};