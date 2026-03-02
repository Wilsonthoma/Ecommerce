// controllers/admin/settingsController.js
import asyncHandler from 'express-async-handler';
import os from 'os';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import GlobalSettings from '../../models/GlobalSettings.js';
import UserSettings from '../../models/UserSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Get all settings
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 */
export const getSettings = asyncHandler(async (req, res) => {
  console.log(`📋 GET Settings requested by: ${req.admin?.email || req.user?.email}`);
  
  // Get or create global settings
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = await GlobalSettings.create({});
    console.log('✅ Created default global settings');
  }
  
  res.status(200).json({
    success: true,
    message: 'Settings retrieved successfully',
    data: settings,
    timestamp: new Date().toISOString()
  });
});

/**
 * @desc    Update settings
 * @route   PUT /api/admin/settings
 * @access  Private/Admin
 */
export const updateSettings = asyncHandler(async (req, res) => {
  console.log(`🔄 UPDATE Settings requested by: ${req.admin?.email || req.user?.email}`);
  console.log('Updates:', JSON.stringify(req.body, null, 2));
  
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  const updates = req.body;
  
  // Validate currency
  if (updates.currency?.code && !['KES', 'USD', 'EUR', 'GBP'].includes(updates.currency.code)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid currency. Allowed: KES, USD, EUR, GBP'
    });
  }
  
  // Validate timezone
  if (updates.timezone && !['Africa/Nairobi', 'UTC', 'Africa/Dar_es_Salaam', 'Africa/Kampala'].includes(updates.timezone)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid timezone'
    });
  }
  
  // Update store info
  if (updates.storeInfo) {
    settings.storeInfo = {
      ...settings.storeInfo.toObject(),
      ...updates.storeInfo
    };
  }
  
  // Update currency
  if (updates.currency) {
    settings.currency = {
      ...settings.currency.toObject(),
      ...updates.currency
    };
  }
  
  // Update shipping
  if (updates.shipping) {
    settings.shipping = {
      ...settings.shipping.toObject(),
      ...updates.shipping
    };
  }
  
  // Update maintenance
  if (updates.maintenance !== undefined) {
    settings.maintenance = {
      ...settings.maintenance.toObject(),
      ...updates.maintenance
    };
  }
  
  // Update social media
  if (updates.socialMedia) {
    settings.socialMedia = {
      ...settings.socialMedia.toObject(),
      ...updates.socialMedia
    };
  }
  
  // Update payment methods
  if (updates.paymentMethods) {
    settings.paymentMethods = updates.paymentMethods;
  }
  
  // Update features
  if (updates.features) {
    settings.features = {
      ...settings.features.toObject(),
      ...updates.features
    };
  }
  
  // Update other top-level fields
  const topLevelFields = [
    'storeName', 'storeEmail', 'storePhone', 'storeAddress', 'storeLogo',
    'currency', 'timezone', 'dateFormat', 'timeFormat',
    'stripePublicKey', 'stripeSecretKey', 'mpesaShortCode', 'mpesaPasskey',
    'mpesaConsumerKey', 'mpesaConsumerSecret', 'standardShippingPrice',
    'expressShippingPrice', 'freeShippingThreshold', 'shippingZones',
    'emailNotifications', 'orderConfirmation', 'shippingUpdates',
    'promotionalEmails', 'adminNotifications', 'smtpHost', 'smtpPort',
    'smtpUsername', 'smtpPassword', 'smtpFromEmail', 'smtpFromName',
    'require2FA', 'sessionTimeout', 'passwordPolicy', 'apiRateLimit',
    'loginAttempts', 'maintenanceMode', 'metaTitle', 'metaDescription',
    'metaKeywords', 'googleAnalyticsId', 'facebookUrl', 'twitterUrl',
    'instagramUrl', 'whatsappNumber'
  ];
  
  topLevelFields.forEach(field => {
    if (updates[field] !== undefined) {
      settings[field] = updates[field];
    }
  });
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  console.log(`✅ Settings updated by: ${req.admin?.email || req.user?.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: settings,
    updatedBy: req.admin?.email || req.user?.email,
    updatedAt: settings.updatedAt
  });
});

/**
 * @desc    Get email settings
 * @route   GET /api/admin/settings/email
 * @access  Private/Admin
 */
export const getEmailSettings = asyncHandler(async (req, res) => {
  const settings = await GlobalSettings.findOne();
  
  const emailSettings = {
    emailNotifications: settings?.emailNotifications ?? true,
    orderConfirmation: settings?.orderConfirmation ?? true,
    shippingUpdates: settings?.shippingUpdates ?? true,
    promotionalEmails: settings?.promotionalEmails ?? false,
    adminNotifications: settings?.adminNotifications ?? true,
    smtpHost: settings?.smtpHost || '',
    smtpPort: settings?.smtpPort || 587,
    smtpUsername: settings?.smtpUsername || '',
    smtpPassword: settings?.smtpPassword || '',
    smtpFromEmail: settings?.smtpFromEmail || 'noreply@kwetushop.co.ke',
    smtpFromName: settings?.smtpFromName || 'KwetuShop'
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
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  const emailUpdates = req.body;
  
  // Update email-related fields
  const emailFields = [
    'emailNotifications', 'orderConfirmation', 'shippingUpdates',
    'promotionalEmails', 'adminNotifications', 'smtpHost', 'smtpPort',
    'smtpUsername', 'smtpPassword', 'smtpFromEmail', 'smtpFromName'
  ];
  
  emailFields.forEach(field => {
    if (emailUpdates[field] !== undefined) {
      settings[field] = emailUpdates[field];
    }
  });
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: 'Email settings updated successfully',
    data: {
      emailNotifications: settings.emailNotifications,
      orderConfirmation: settings.orderConfirmation,
      shippingUpdates: settings.shippingUpdates,
      promotionalEmails: settings.promotionalEmails,
      adminNotifications: settings.adminNotifications
    }
  });
});

/**
 * @desc    Get system information
 * @route   GET /api/admin/settings/system-info
 * @access  Private/Admin
 */
export const getSystemInfo = asyncHandler(async (req, res) => {
  const settings = await GlobalSettings.findOne();
  
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
      settingsCount: settings ? Object.keys(settings.toObject()).length : 0,
      maintenanceMode: settings?.maintenance?.isEnabled || false,
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
  const { enabled, message } = req.body;
  
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'Please provide enabled status (true/false)'
    });
  }
  
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  settings.maintenance = {
    isEnabled: enabled,
    message: message || settings.maintenance?.message || 'Site under maintenance',
    allowedIps: settings.maintenance?.allowedIps || []
  };
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
    data: {
      maintenanceMode: settings.maintenance.isEnabled,
      updatedAt: settings.updatedAt,
      updatedBy: req.admin?.email || req.user?.email
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
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  if (type === 'logo') {
    settings.storeLogo = fileUrl;
  } else if (type === 'favicon') {
    settings.favicon = fileUrl;
  } else if (type === 'banner') {
    settings.storeBanner = fileUrl;
  }
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
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
      uploadedBy: req.admin?.email || req.user?.email,
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
  console.log(`🔄 RESET Settings requested by: ${req.admin?.email || req.user?.email}`);
  
  await GlobalSettings.deleteMany({});
  const settings = await GlobalSettings.create({});
  
  res.status(200).json({
    success: true,
    message: 'Settings reset to defaults',
    data: settings,
    resetBy: req.admin?.email || req.user?.email,
    resetAt: new Date().toISOString()
  });
});

// ==================== HELPER FUNCTIONS ====================

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