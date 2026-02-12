// controllers/admin/settingsController.js
import asyncHandler from 'express-async-handler';
import os from 'os';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default settings
const defaultSettings = {
  // General Settings
  storeName: 'KwetuShop',
  storeEmail: 'admin@kwetushop.co.ke',
  storePhone: '+254712345678',
  storeAddress: '123 Kimathi Street, Nairobi, Kenya',
  storeLogo: '/uploads/logo.png',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: '24h',
  
  // Payment Settings
  paymentMethods: ['mpesa', 'card', 'cash_on_delivery'],
  stripePublicKey: '',
  stripeSecretKey: '',
  mpesaShortCode: '174379',
  mpesaPasskey: '',
  mpesaConsumerKey: '',
  mpesaConsumerSecret: '',
  
  // Shipping Settings
  shippingMethods: ['standard', 'express', 'pickup'],
  standardShippingPrice: 200,
  expressShippingPrice: 500,
  freeShippingThreshold: 2000,
  shippingZones: [
    { name: 'Nairobi', price: 150 },
    { name: 'Mombasa', price: 300 },
    { name: 'Kisumu', price: 250 }
  ],
  
  // Email Settings
  emailNotifications: true,
  orderConfirmation: true,
  shippingUpdates: true,
  promotionalEmails: false,
  adminNotifications: true,
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  smtpFromEmail: 'noreply@kwetushop.co.ke',
  smtpFromName: 'KwetuShop',
  
  // Security Settings
  require2FA: false,
  sessionTimeout: 30,
  passwordPolicy: 'medium',
  apiRateLimit: 100,
  loginAttempts: 5,
  maintenanceMode: false,
  
  // SEO Settings
  metaTitle: 'KwetuShop - Online Shopping in Kenya',
  metaDescription: 'Best online shopping in Kenya with quality products and fast delivery',
  metaKeywords: 'online shopping, kenya, electronics, fashion, home',
  googleAnalyticsId: '',
  
  // Social Media
  facebookUrl: '',
  twitterUrl: '',
  instagramUrl: '',
  whatsappNumber: '',
  
  // Timestamps
  createdAt: new Date(),
  updatedAt: new Date(),
  updatedBy: null
};

// In-memory settings storage (in production, use database)
let currentSettings = { ...defaultSettings };

// Load settings on startup
loadSettingsFromFile();

/**
 * @desc    Get all settings
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 */
export const getSettings = asyncHandler(async (req, res) => {
  console.log(`📋 GET Settings requested by: ${req.admin.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Settings retrieved successfully',
    data: currentSettings,
    timestamp: new Date().toISOString()
  });
});

/**
 * @desc    Update settings
 * @route   PUT /api/admin/settings
 * @access  Private/Admin
 */
export const updateSettings = asyncHandler(async (req, res) => {
  console.log(`🔄 UPDATE Settings requested by: ${req.admin.email}`);
  console.log('Updates:', JSON.stringify(req.body, null, 2));
  
  const updates = req.body;
  
  // Validate updates
  if (updates.currency && !['KES', 'USD', 'EUR', 'GBP'].includes(updates.currency)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid currency. Allowed: KES, USD, EUR, GBP'
    });
  }
  
  if (updates.timezone && !['Africa/Nairobi', 'UTC', 'Africa/Dar_es_Salaam', 'Africa/Kampala'].includes(updates.timezone)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid timezone'
    });
  }
  
  // Update settings
  currentSettings = {
    ...currentSettings,
    ...updates,
    updatedAt: new Date(),
    updatedBy: req.admin.id
  };
  
  // Save to file for persistence
  saveSettingsToFile();
  
  console.log(`✅ Settings updated by: ${req.admin.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: currentSettings,
    updatedBy: req.admin.email,
    updatedAt: currentSettings.updatedAt
  });
});

/**
 * @desc    Get email settings
 * @route   GET /api/admin/settings/email
 * @access  Private/Admin
 */
export const getEmailSettings = asyncHandler(async (req, res) => {
  const emailSettings = {
    emailNotifications: currentSettings.emailNotifications,
    orderConfirmation: currentSettings.orderConfirmation,
    shippingUpdates: currentSettings.shippingUpdates,
    promotionalEmails: currentSettings.promotionalEmails,
    adminNotifications: currentSettings.adminNotifications,
    smtpHost: currentSettings.smtpHost,
    smtpPort: currentSettings.smtpPort,
    smtpUsername: currentSettings.smtpUsername,
    smtpPassword: currentSettings.smtpPassword,
    smtpFromEmail: currentSettings.smtpFromEmail,
    smtpFromName: currentSettings.smtpFromName
  };
  
  res.status(200).json({
    success: true,
    data: emailSettings
  });
});

/**
 * @desc    Update email settings
 * @route   PUT /api/admin/settings/email
 * @access  Private/Admin
 */
export const updateEmailSettings = asyncHandler(async (req, res) => {
  const emailUpdates = req.body;
  
  // Update only email-related settings
  currentSettings = {
    ...currentSettings,
    ...emailUpdates,
    updatedAt: new Date(),
    updatedBy: req.admin.id
  };
  
  saveSettingsToFile();
  
  res.status(200).json({
    success: true,
    message: 'Email settings updated successfully',
    data: {
      emailNotifications: currentSettings.emailNotifications,
      orderConfirmation: currentSettings.orderConfirmation,
      shippingUpdates: currentSettings.shippingUpdates,
      promotionalEmails: currentSettings.promotionalEmails,
      adminNotifications: currentSettings.adminNotifications
    }
  });
});

/**
 * @desc    Get system information
 * @route   GET /api/admin/settings/system-info
 * @access  Private/Admin
 */
export const getSystemInfo = asyncHandler(async (req, res) => {
  const systemInfo = {
    server: {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: formatUptime(os.uptime()),
      loadAvg: os.loadavg(),
      totalMemory: formatBytes(os.totalmem()),
      freeMemory: formatBytes(os.freemem()),
      memoryUsage: `${((1 - os.freemem() / os.totalmem()) * 100).toFixed(2)}%`,
      cpus: os.cpus().length,
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'development'
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host || 'not connected',
      name: mongoose.connection.name || 'not connected',
      version: await getMongoVersion()
    },
    application: {
      uptime: formatUptime(process.uptime()),
      memoryUsage: formatBytes(process.memoryUsage().heapUsed),
      pid: process.pid,
      settingsCount: Object.keys(currentSettings).length,
      maintenanceMode: currentSettings.maintenanceMode,
      version: '1.0.0'
    },
    network: {
      interfaces: getNetworkInterfaces()
    }
  };
  
  res.status(200).json({
    success: true,
    data: systemInfo
  });
});

/**
 * @desc    Toggle maintenance mode
 * @route   PATCH /api/admin/settings/maintenance
 * @access  Private/Admin
 */
export const toggleMaintenance = asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'Please provide enabled status (true/false)'
    });
  }
  
  currentSettings.maintenanceMode = enabled;
  currentSettings.updatedAt = new Date();
  currentSettings.updatedBy = req.admin.id;
  
  saveSettingsToFile();
  
  res.status(200).json({
    success: true,
    message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
    data: {
      maintenanceMode: currentSettings.maintenanceMode,
      updatedAt: currentSettings.updatedAt,
      updatedBy: req.admin.email
    }
  });
});

/**
 * @desc    Upload file (logo, etc.)
 * @route   POST /api/admin/settings/upload
 * @access  Private/Admin
 */
export const uploadFile = asyncHandler(async (req, res) => {
  console.log('📤 File upload request received');
  console.log('File:', req.file);
  console.log('Body:', req.body);
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }
  
  const { type = 'logo' } = req.body;
  const allowedTypes = ['logo', 'favicon', 'banner'];
  
  if (!allowedTypes.includes(type)) {
    // Remove the uploaded file if type is invalid
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting invalid file:', err);
      });
    }
    
    return res.status(400).json({
      success: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
    });
  }
  
  // Check file type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    // Remove invalid file
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting invalid file:', err);
      });
    }
    
    return res.status(400).json({
      success: false,
      error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'
    });
  }
  
  // File is already saved by multer, get its info
  const filename = path.basename(req.file.path);
  const fileUrl = `/uploads/${filename}`;
  
  console.log(`✅ File saved: ${filename}`);
  console.log(`   URL: ${fileUrl}`);
  console.log(`   Type: ${type}`);
  console.log(`   Size: ${formatBytes(req.file.size)}`);
  
  // Update settings
  if (type === 'logo') {
    currentSettings.storeLogo = fileUrl;
  } else if (type === 'favicon') {
    currentSettings.favicon = fileUrl;
  } else if (type === 'banner') {
    currentSettings.storeBanner = fileUrl;
  }
  
  currentSettings.updatedAt = new Date();
  currentSettings.updatedBy = req.admin.id;
  
  saveSettingsToFile();
  
  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url: fileUrl,
      type,
      filename,
      size: req.file.size,
      formattedSize: formatBytes(req.file.size),
      mimetype: req.file.mimetype,
      originalName: req.file.originalname,
      uploadedBy: req.admin.email,
      uploadedAt: new Date().toISOString()
    }
  });
});

/**
 * @desc    Reset settings to defaults
 * @route   POST /api/admin/settings/reset
 * @access  Private/Admin
 */
export const resetSettings = asyncHandler(async (req, res) => {
  console.log(`🔄 RESET Settings requested by: ${req.admin.email}`);
  
  currentSettings = { 
    ...defaultSettings,
    resetBy: req.admin.id,
    resetAt: new Date(),
    updatedAt: new Date(),
    updatedBy: req.admin.id
  };
  
  saveSettingsToFile();
  
  res.status(200).json({
    success: true,
    message: 'Settings reset to defaults',
    data: currentSettings,
    resetBy: req.admin.email,
    resetAt: currentSettings.resetAt
  });
});

// ==================== HELPER FUNCTIONS ====================

function saveSettingsToFile() {
  const settingsFile = path.join(__dirname, '../../../settings.json');
  const data = {
    ...currentSettings,
    _savedAt: new Date().toISOString()
  };
  
  try {
    fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2));
    console.log(`💾 Settings saved to file: ${settingsFile}`);
  } catch (error) {
    console.error('❌ Error saving settings to file:', error);
  }
}

function loadSettingsFromFile() {
  const settingsFile = path.join(__dirname, '../../../settings.json');
  
  try {
    if (fs.existsSync(settingsFile)) {
      const data = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      currentSettings = { ...defaultSettings, ...data };
      console.log(`📂 Settings loaded from file: ${settingsFile}`);
      console.log(`   Store name: ${currentSettings.storeName}`);
      console.log(`   Currency: ${currentSettings.currency}`);
      console.log(`   Last updated: ${currentSettings.updatedAt}`);
    } else {
      console.log('📝 No settings file found, using defaults');
      saveSettingsToFile(); // Create initial settings file
    }
  } catch (error) {
    console.error('❌ Error loading settings from file:', error);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const result = {};
  
  Object.keys(interfaces).forEach(name => {
    const addresses = interfaces[name]
      .filter(info => info.family === 'IPv4' && !info.internal)
      .map(info => ({
        address: info.address,
        netmask: info.netmask,
        mac: info.mac
      }));
    
    if (addresses.length > 0) {
      result[name] = addresses;
    }
  });
  
  return result;
}

async function getMongoVersion() {
  try {
    const adminDb = mongoose.connection.db.admin();
    const buildInfo = await adminDb.serverInfo();
    return buildInfo.version;
  } catch (error) {
    console.error('Error getting MongoDB version:', error);
    return 'unknown';
  }
}