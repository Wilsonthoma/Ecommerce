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
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  useCloudStorage = true;
  storageType = 's3';
}

// Initialize Cloudinary if configured
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  useCloudStorage = true;
  storageType = 'cloudinary';
}

// Create uploads directory for local storage
export const createUploadsDir = (dirPath) => {
  const resolvedPath = path.resolve(__dirname, '..', '..', dirPath);
  if (!fs.existsSync(resolvedPath)) {
    fs.mkdirSync(resolvedPath, { recursive: true });
    log.info(`Created uploads directory: ${resolvedPath}`);
  }
  return resolvedPath;
};

// Determine storage based on configuration
const getStorage = () => {
  if (storageType === 's3' && s3Client) {
    return multerS3({
      s3: s3Client,
      bucket: process.env.AWS_S3_BUCKET || 'your-bucket-name',
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const folder = determineFolder(req);
        const filename = generateFilename(file);
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

  // Fallback to local storage
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = determineFolder(req);
      const uploadPath = `uploads/${folder}`;
      const absolutePath = createUploadsDir(uploadPath);
      cb(null, absolutePath);
    },
    filename: (req, file, cb) => {
      const filename = generateFilename(file);
      cb(null, filename);
    }
  });
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

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': '.jpeg,.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
  };

  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  // Check MIME type and extension
  if (allowedTypes[file.mimetype] && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${Object.values(allowedTypes).join(', ')}`));
  }
};

// Configure multer
export const upload = multer({
  storage: getStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 10) * 1024 * 1024, // MB to bytes
    files: parseInt(process.env.MAX_FILES_PER_UPLOAD || 10)
  },
  fileFilter,
  onError: (err, next) => {
    log.error('File upload error', err);
    next(err);
  }
});

// Upload middleware with specific field names
export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadArray = (fieldName, maxCount) => upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);

// Helper function to delete file
export const deleteFile = async (filePathOrUrl) => {
  try {
    // Determine storage type from URL/path
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
    const key = url.pathname.slice(1); // Remove leading slash
    
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
      // Extract public ID from URL
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

// Get file optimized for performance
export const getOptimizedFileUrl = (filename, folder = 'misc', options = {}) => {
  if (!filename) return null;
  
  const { width = 800, height = 800, format = 'auto', quality = 'auto' } = options;
  
  if (storageType === 'cloudinary') {
    return cloudinary.url(`${folder}/${filename}`, {
      secure: true,
      width,
      height,
      crop: 'fit',
      fetch_format: format,
      quality
    });
  }
  
  return getFileUrl(filename, folder);
};

// Upload to Cloudinary directly
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'uploads',
        public_id: options.publicId || undefined,
        resource_type: options.resourceType || 'auto',
        transformation: options.transformation || []
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          size: result.bytes
        });
      }
    ).end(fileBuffer);
  });
};

// Generate image variants
export const generateImageVariants = async (publicId, sizes = [
  { width: 100, height: 100, crop: 'thumb' },  // Thumbnail
  { width: 400, height: 400, crop: 'fit' },    // Mobile
  { width: 800, height: 800, crop: 'fit' }     // Desktop
]) => {
  if (storageType !== 'cloudinary') {
    log.warn('Image variants only available with Cloudinary');
    return null;
  }
  
  const variants = {};
  
  for (const [index, size] of sizes.entries()) {
    const variantPublicId = `${publicId}_${size.width}x${size.height}`;
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        eager: [size],
        eager_async: false,
        public_id: variantPublicId
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    
    variants[`${size.width}x${size.height}`] = result.eager[0].secure_url;
  }
  
  return variants;
};

// Validate file before upload
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedMimes = ['image/jpeg', 'image/png', 'image/webp'],
    minWidth = null,
    minHeight = null
  } = options;
  
  const errors = [];
  
  // Check size
  if (file.size > maxSize) {
    errors.push(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
  }
  
  // Check MIME type
  if (!allowedMimes.includes(file.mimetype)) {
    errors.push(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  upload,
  uploadSingle,
  uploadArray,
  uploadFields,
  deleteFile,
  getFileUrl,
  getOptimizedFileUrl,
  uploadToCloudinary,
  generateImageVariants,
  validateFile,
  createUploadsDir
};