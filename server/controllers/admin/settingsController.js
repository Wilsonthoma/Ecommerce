import asyncHandler from 'express-async-handler';
import os from 'os';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import GlobalSettings from '../../models/GlobalSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Get all settings
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 */
export const getSettings = asyncHandler(async (req, res) => {
  console.log(`📋 GET Settings requested by: ${req.admin?.email || req.user?.email}`);
  
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
  
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  const updates = req.body;
  
  // Update all sections
  const sections = [
    'customerSettings',
    'productDisplay',
    'checkoutSettings',
    'emailTemplates',
    'smsTemplates',
    'legalSettings',
    'paymentDisplay',
    'seoSettings'
  ];
  
  sections.forEach(section => {
    if (updates[section]) {
      settings[section] = {
        ...(settings[section]?.toObject() || {}),
        ...updates[section]
      };
    }
  });
  
  // Update top-level fields
  const topLevelFields = [
    'storeName', 'storeEmail', 'storePhone', 'storeAddress', 'storeLogo',
    'favicon', 'storeDescription', 'storeKeywords', 'enableWhatsApp',
    'whatsappNumber', 'socialLinks', 'currency', 'timezone',
    'paymentMethods', 'stripePublicKey', 'stripeSecretKey', 'stripeWebhookSecret',
    'mpesaShortCode', 'mpesaPasskey', 'mpesaConsumerKey', 'mpesaConsumerSecret',
    'mpesaTestMode', 'shippingMethods', 'standardShippingPrice', 'expressShippingPrice',
    'freeShippingThreshold', 'shippingZones', 'processingTimeDays',
    'standardDeliveryDays', 'expressDeliveryDays', 'freeShippingMessage',
    'estimatedDeliveryMessage', 'enableOrderTracking', 'trackingUrl',
    'sendTrackingEmail', 'emailNotifications', 'orderConfirmation',
    'shippingUpdates', 'promotionalEmails', 'smsNotifications', 'adminNotifications',
    'require2FA', 'sessionTimeout', 'passwordPolicy', 'apiRateLimit',
    'loginAttempts', 'ipWhitelist', 'maintenanceMode', 'maintenanceMessage',
    'taxRate', 'taxName', 'taxInclusive', 'taxableProducts', 'taxShipping'
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
    data: settings
  });
});

/**
 * @desc    Get email settings
 * @route   GET /api/admin/settings/email
 * @access  Private/Admin
 */
export const getEmailSettings = asyncHandler(async (req, res) => {
  const settings = await GlobalSettings.findOne();
  
  res.status(200).json({
    success: true,
    data: settings?.emailTemplates || {
      fromEmail: 'noreply@kwetushop.co.ke',
      fromName: 'KwetuShop',
      replyToEmail: 'support@kwetushop.co.ke',
      welcomeEmailSubject: 'Welcome to KwetuShop!',
      welcomeEmailBody: 'Thank you for joining KwetuShop!',
      orderConfirmationSubject: 'Order #{orderNumber} Confirmed',
      orderConfirmationBody: 'Your order has been received.',
      shippingUpdateSubject: 'Your order #{orderNumber} has shipped',
      shippingUpdateBody: 'Your order is on its way!',
      resetPasswordSubject: 'Password Reset Request',
      resetPasswordBody: 'Click the link below to reset your password.',
      emailFooterText: 'Thank you for shopping with KwetuShop',
      emailFooterSocial: true,
      emailUnsubscribeLink: true
    }
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
  
  settings.emailTemplates = {
    ...(settings.emailTemplates?.toObject() || {}),
    ...req.body
  };
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: 'Email settings updated successfully',
    data: settings.emailTemplates
  });
});

/**
 * @desc    Get SMS settings
 * @route   GET /api/admin/settings/sms
 * @access  Private/Admin
 */
export const getSmsSettings = asyncHandler(async (req, res) => {
  const settings = await GlobalSettings.findOne();
  
  res.status(200).json({
    success: true,
    data: settings?.smsTemplates || {
      smsProvider: 'africastalking',
      smsApiKey: '',
      smsApiSecret: '',
      smsSenderId: 'KwetuShop',
      orderConfirmationSms: 'Order #{orderNumber} confirmed. KSh{amount}. Thank you!',
      shippingUpdateSms: 'Order #{orderNumber} shipped. Track: {tracking}',
      deliveryNotificationSms: 'Your order has been delivered!',
      welcomeSms: 'Welcome to KwetuShop!',
      otpSms: 'Your verification code is: {code}',
      smsNotifications: true
    }
  });
});

/**
 * @desc    Update SMS settings
 * @route   PUT /api/admin/settings/sms
 * @access  Private/Admin
 */
export const updateSmsSettings = asyncHandler(async (req, res) => {
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  settings.smsTemplates = {
    ...(settings.smsTemplates?.toObject() || {}),
    ...req.body
  };
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: 'SMS settings updated successfully',
    data: settings.smsTemplates
  });
});

/**
 * @desc    Get legal settings
 * @route   GET /api/admin/settings/legal
 * @access  Private/Admin
 */
export const getLegalSettings = asyncHandler(async (req, res) => {
  const settings = await GlobalSettings.findOne();
  
  res.status(200).json({
    success: true,
    data: settings?.legalSettings || {
      termsOfServiceUrl: '/terms',
      privacyPolicyUrl: '/privacy',
      refundPolicyUrl: '/refund-policy',
      shippingPolicyUrl: '/shipping-policy',
      enableCookieConsent: true,
      cookieConsentMessage: 'We use cookies to enhance your experience.',
      enableGdpr: true,
      dataRetentionDays: 365,
      allowDataExport: true,
      allowAccountDeletion: true,
      ageRestricted: false,
      minimumAge: 18
    }
  });
});

/**
 * @desc    Update legal settings
 * @route   PUT /api/admin/settings/legal
 * @access  Private/Admin
 */
export const updateLegalSettings = asyncHandler(async (req, res) => {
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  settings.legalSettings = {
    ...(settings.legalSettings?.toObject() || {}),
    ...req.body
  };
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: 'Legal settings updated successfully',
    data: settings.legalSettings
  });
});

/**
 * @desc    Get product display settings
 * @route   GET /api/admin/settings/product-display
 * @access  Private/Admin
 */
export const getProductDisplaySettings = asyncHandler(async (req, res) => {
  const settings = await GlobalSettings.findOne();
  
  res.status(200).json({
    success: true,
    data: settings?.productDisplay || {
      showProductRating: true,
      showProductBadges: true,
      showDiscountBadge: true,
      showStockStatus: true,
      enableZoomOnHover: true,
      enableGalleryLightbox: true,
      showRelatedProducts: true,
      recentlyViewedCount: 4
    }
  });
});

/**
 * @desc    Update product display settings
 * @route   PUT /api/admin/settings/product-display
 * @access  Private/Admin
 */
export const updateProductDisplaySettings = asyncHandler(async (req, res) => {
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  settings.productDisplay = {
    ...(settings.productDisplay?.toObject() || {}),
    ...req.body
  };
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: 'Product display settings updated successfully',
    data: settings.productDisplay
  });
});

/**
 * @desc    Get checkout settings
 * @route   GET /api/admin/settings/checkout
 * @access  Private/Admin
 */
export const getCheckoutSettings = asyncHandler(async (req, res) => {
  const settings = await GlobalSettings.findOne();
  
  res.status(200).json({
    success: true,
    data: settings?.checkoutSettings || {
      allowGuestCheckout: true,
      requirePhone: true,
      requireCompany: false,
      enableNotes: true,
      cartExpiryDays: 30
    }
  });
});

/**
 * @desc    Update checkout settings
 * @route   PUT /api/admin/settings/checkout
 * @access  Private/Admin
 */
export const updateCheckoutSettings = asyncHandler(async (req, res) => {
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  settings.checkoutSettings = {
    ...(settings.checkoutSettings?.toObject() || {}),
    ...req.body
  };
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: 'Checkout settings updated successfully',
    data: settings.checkoutSettings
  });
});

/**
 * @desc    Get customer settings
 * @route   GET /api/admin/settings/customer
 * @access  Private/Admin
 */
export const getCustomerSettings = asyncHandler(async (req, res) => {
  const settings = await GlobalSettings.findOne();
  
  res.status(200).json({
    success: true,
    data: settings?.customerSettings || {
      allowRegistration: true,
      requireEmailVerification: true,
      requirePhoneVerification: false,
      enableSocialLogin: false,
      socialLoginProviders: [],
      enableWishlist: true,
      enableReviews: true,
      enableOrderTracking: true,
      enableReturns: true,
      returnsWindowDays: 14,
      enableSavedAddresses: true
    }
  });
});

/**
 * @desc    Update customer settings
 * @route   PUT /api/admin/settings/customer
 * @access  Private/Admin
 */
export const updateCustomerSettings = asyncHandler(async (req, res) => {
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  settings.customerSettings = {
    ...(settings.customerSettings?.toObject() || {}),
    ...req.body
  };
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: 'Customer settings updated successfully',
    data: settings.customerSettings
  });
});

/**
 * @desc    Get payment display settings
 * @route   GET /api/admin/settings/payment-display
 * @access  Private/Admin
 */
export const getPaymentDisplaySettings = asyncHandler(async (req, res) => {
  const settings = await GlobalSettings.findOne();
  
  res.status(200).json({
    success: true,
    data: settings?.paymentDisplay || {
      showPaymentIcons: true,
      paymentIcons: ['visa', 'mastercard', 'mpesa', 'airtel'],
      acceptedCards: ['visa', 'mastercard', 'amex'],
      securePaymentMessage: 'Your payment information is secure',
      installmentMessage: 'Pay in installments from KSh 500/month'
    }
  });
});

/**
 * @desc    Update payment display settings
 * @route   PUT /api/admin/settings/payment-display
 * @access  Private/Admin
 */
export const updatePaymentDisplaySettings = asyncHandler(async (req, res) => {
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  settings.paymentDisplay = {
    ...(settings.paymentDisplay?.toObject() || {}),
    ...req.body
  };
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: 'Payment display settings updated successfully',
    data: settings.paymentDisplay
  });
});

/**
 * @desc    Get SEO settings
 * @route   GET /api/admin/settings/seo
 * @access  Private/Admin
 */
export const getSeoSettings = asyncHandler(async (req, res) => {
  const settings = await GlobalSettings.findOne();
  
  res.status(200).json({
    success: true,
    data: settings?.seoSettings || {
      metaTitle: 'KwetuShop - Best Electronics Store in Kenya',
      metaDescription: 'Shop the latest smartphones, laptops, and electronics.',
      metaKeywords: 'electronics, smartphones, laptops, Kenya',
      robotsTxt: 'User-agent: *\nAllow: /',
      sitemapEnabled: true,
      googleAnalyticsId: '',
      facebookPixelId: '',
      enableEnhancedEcommerce: true,
      ogImage: '',
      twitterCard: 'summary_large_image',
      enableSocialShare: true,
      enableAnalytics: true,
      trackPurchases: true
    }
  });
});

/**
 * @desc    Update SEO settings
 * @route   PUT /api/admin/settings/seo
 * @access  Private/Admin
 */
export const updateSeoSettings = asyncHandler(async (req, res) => {
  let settings = await GlobalSettings.findOne();
  if (!settings) {
    settings = new GlobalSettings();
  }
  
  settings.seoSettings = {
    ...(settings.seoSettings?.toObject() || {}),
    ...req.body
  };
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: 'SEO settings updated successfully',
    data: settings.seoSettings
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
      maintenanceMode: settings?.maintenanceMode || false,
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
  
  settings.maintenanceMode = enabled;
  if (message) settings.maintenanceMessage = message;
  
  settings.updatedBy = req.admin?._id || req.user?._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
    data: {
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      updatedAt: settings.updatedAt
    }
  });
});

/**
 * @desc    Upload file
 * @route   POST /api/admin/settings/upload
 * @access  Private/Admin
 */
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }
  
  const { type = 'logo' } = req.body;
  const allowedTypes = ['logo', 'favicon', 'banner'];
  
  if (!allowedTypes.includes(type)) {
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
  
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
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
  
  const filename = path.basename(req.file.path);
  const fileUrl = `/uploads/${filename}`;
  
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
      mimetype: req.file.mimetype
    }
  });
});

/**
 * @desc    Reset settings to defaults
 * @route   POST /api/admin/settings/reset
 * @access  Private/Admin
 */
export const resetSettings = asyncHandler(async (req, res) => {
  await GlobalSettings.deleteMany({});
  const settings = await GlobalSettings.create({});
  
  res.status(200).json({
    success: true,
    message: 'Settings reset to defaults',
    data: settings
  });
});

// Helper functions
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