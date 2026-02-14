// server/utils/upload.js
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import config from '../config/env.js';
import { log } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize storage clients
let s3Client = null;
let useCloudStorage = false;
let storageType = 'local'; // 'local', 's3', 'cloudinary'

// Initialize S3 if configured
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  try {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    useCloudStorage = true;
    storageType = 's3';
    console.log('✅ S3 storage configured');
  } catch (error) {
    console.log('⚠️ S3 configuration failed, falling back to local storage:', error.message);
    storageType = 'local';
  }
}

// Initialize Cloudinary if configured
if (process.env.CLOUDINARY_CLOUD_NAME && !s3Client) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    useCloudStorage = true;
    storageType = 'cloudinary';
    console.log('✅ Cloudinary storage configured');
  } catch (error) {
    console.log('⚠️ Cloudinary configuration failed, falling back to local storage:', error.message);
    storageType = 'local';
  }
}

console.log('📦 Using storage type:', storageType);

// Create uploads directory for local storage
export const createUploadsDir = (dirPath) => {
  const resolvedPath = path.resolve(__dirname, '..', '..', dirPath);
  if (!fs.existsSync(resolvedPath)) {
    fs.mkdirSync(resolvedPath, { recursive: true });
    console.log(`📁 Created uploads directory: ${resolvedPath}`);
    log.info(`Created uploads directory: ${resolvedPath}`);
  } else {
    console.log(`📁 Uploads directory exists: ${resolvedPath}`);
  }
  
  // Check if writable
  try {
    fs.accessSync(resolvedPath, fs.constants.W_OK);
    console.log(`✅ Uploads directory is writable: ${resolvedPath}`);
  } catch (err) {
    console.error(`❌ Uploads directory is NOT writable: ${resolvedPath}`, err);
    try {
      fs.chmodSync(resolvedPath, 0o755);
      console.log(`✅ Fixed permissions for: ${resolvedPath}`);
    } catch (chmodErr) {
      console.error(`❌ Could not fix permissions:`, chmodErr);
    }
  }
  
  return resolvedPath;
};

// Determine folder based on request
const determineFolder = (req) => {
  if (req.baseUrl?.includes('/products')) return 'products';
  if (req.baseUrl?.includes('/users') || req.baseUrl?.includes('/auth')) return 'avatars';
  if (req.baseUrl?.includes('/admin')) return 'admin';
  if (req.baseUrl?.includes('/categories')) return 'categories';
  return 'misc';
};

// Generate unique filename
const generateFilename = (file) => {
  const uniqueId = uuidv4();
  const extension = path.extname(file.originalname).toLowerCase();
  const timestamp = Date.now();
  const sanitizedName = file.originalname
    .replace(extension, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .slice(0, 50);
  
  return `${sanitizedName}-${timestamp}-${uniqueId.slice(0, 8)}${extension}`;
};

// Create storage based on configuration
const createStorage = () => {
  if (storageType === 's3' && s3Client) {
    console.log('📦 Using S3 storage');
    return multerS3({
      s3: s3Client,
      bucket: process.env.AWS_S3_BUCKET || 'your-bucket-name',
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const folder = determineFolder(req);
        const filename = generateFilename(file);
        console.log(`📸 Saving to S3: ${folder}/${filename}`);
        cb(null, `${folder}/${filename}`);
      },
      metadata: (req, file, cb) => {
        cb(null, {
          originalName: file.originalname,
          uploadedBy: req.user?.id || 'anonymous',
          uploadTime: new Date().toISOString()
        });
      }
    });
  }

  console.log('📦 Using local storage');
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = determineFolder(req);
      const uploadPath = `uploads/${folder}`;
      console.log(`📁 Destination folder: ${uploadPath}`);
      const absolutePath = createUploadsDir(uploadPath);
      cb(null, absolutePath);
    },
    filename: (req, file, cb) => {
      const filename = generateFilename(file);
      console.log(`📸 Saving file as: ${filename}`);
      cb(null, filename);
    }
  });
};

// File filter
const fileFilter = (req, file, cb) => {
  console.log(`🔍 Checking file: ${file.originalname}, MIME: ${file.mimetype}`);
  
  const allowedMimes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    console.log('✅ Image file type accepted');
    cb(null, true);
  } else {
    console.log('❌ File type rejected:', file.mimetype);
    cb(new Error('Only JPG, PNG, GIF, and WEBP images are allowed!'), false);
  }
};

// Create the main multer instance
const storage = createStorage();

// ✅ EXPORT THE MULTER INSTANCE DIRECTLY
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  },
  fileFilter: fileFilter
});

console.log('✅ Main upload multer initialized successfully');

// Upload middleware with specific field names
export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadArray = (fieldName, maxCount) => upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);

// Helper function to delete file
export const deleteFile = async (filePathOrUrl) => {
  try {
    if (storageType === 's3' && filePathOrUrl.includes('amazonaws.com')) {
      return await deleteFromS3(filePathOrUrl);
    } else if (storageType === 'cloudinary' || filePathOrUrl.includes('cloudinary')) {
      return await deleteFromCloudinary(filePathOrUrl);
    } else {
      return await deleteFromLocal(filePathOrUrl);
    }
  } catch (error) {
    log.error('Error deleting file:', error);
    return false;
  }
};

// Delete from local storage
export const deleteFromLocal = (filePath) => {
  try {
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(__dirname, '..', '..', filePath);
    
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      log.info(`File deleted from local storage: ${absolutePath}`);
      return true;
    }
    return false;
  } catch (error) {
    log.error('Error deleting local file:', error);
    return false;
  }
};

// Delete from S3
export const deleteFromS3 = async (fileUrl) => {
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1);
    
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    }));
    
    log.info(`File deleted from S3: ${key}`);
    return true;
  } catch (error) {
    log.error('Error deleting S3 file:', error);
    return false;
  }
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (fileUrl) => {
  return new Promise((resolve) => {
    try {
      const parts = fileUrl.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0];
      
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          log.error('Error deleting Cloudinary file:', error);
          resolve(false);
        } else {
          log.info(`File deleted from Cloudinary: ${publicId}`, result);
          resolve(true);
        }
      });
    } catch (error) {
      log.error('Error deleting Cloudinary file:', error);
      resolve(false);
    }
  });
};

// Get file URL
export const getFileUrl = (filename, folder = 'misc') => {
  if (!filename) return null;
  
  switch (storageType) {
    case 's3':
      return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${filename}`;
    case 'cloudinary':
      return cloudinary.url(`${folder}/${filename}`, {
        secure: true,
        fetch_format: 'auto',
        quality: 'auto'
      });
    default:
      return `/uploads/${folder}/${filename}`;
  }
};

// Get optimized file URL
export const getOptimizedFileUrl = (filename, folder = 'misc', options = {}) => {
  return getFileUrl(filename, folder);
};

// Simplified upload to Cloudinary
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  console.log('⚠️ uploadToCloudinary not fully implemented, using local storage');
  return {
    url: '/uploads/temp/' + Date.now() + '.jpg',
    publicId: 'temp',
    format: 'jpg',
    width: 0,
    height: 0,
    size: fileBuffer.length
  };
};

// Simplified generate image variants
export const generateImageVariants = async (publicId, sizes = []) => {
  console.log('⚠️ generateImageVariants not fully implemented');
  return null;
};

// Simplified validate file
export const validateFile = (file, options = {}) => {
  const errors = [];
  
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File too large. Maximum size is 10MB');
  }
  
  if (!file.mimetype.startsWith('image/')) {
    errors.push('Only image files are allowed');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Test endpoint function
export const testUpload = (req, res) => {
  console.log('📤 Test upload endpoint hit!');
  console.log('Files received:', req.files?.length || 0);
  console.log('Body received:', req.body);
  
  if (req.files && req.files.length > 0) {
    console.log('File details:', req.files.map(f => ({
      filename: f.filename,
      size: f.size,
      mimetype: f.mimetype,
      path: f.path
    })));
    
    res.json({
      success: true,
      message: 'Upload test successful',
      files: req.files.map(f => ({
        filename: f.filename,
        size: f.size,
        mimetype: f.mimetype,
        url: getFileUrl(f.filename, determineFolder(req))
      }))
    });
  } else {
    res.json({
      success: false,
      message: 'No files received',
      body: req.body
    });
  }
};