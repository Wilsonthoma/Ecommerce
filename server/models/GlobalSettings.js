// models/GlobalSettings.js
import mongoose from 'mongoose';

const globalSettingsSchema = new mongoose.Schema({
  // Store Information
  storeInfo: {
    name: {
      type: String,
      default: 'KwetuShop',
      trim: true
    },
    email: {
      type: String,
      default: 'info@kwetushop.com',
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    phone: {
      type: String,
      default: '+254 700 000 000'
    },
    address: {
      type: String,
      default: 'Nairobi, Kenya'
    },
    description: {
      type: String,
      default: 'Your trusted online store'
    },
    logo: {
      type: String,
      default: '/uploads/logo.png'
    },
    favicon: {
      type: String,
      default: '/uploads/favicon.ico'
    },
    banner: {
      type: String,
      default: '/uploads/banner.jpg'
    }
  },

  // Currency & Tax
  currency: {
    code: {
      type: String,
      enum: ['KES', 'USD', 'EUR', 'GBP'],
      default: 'KES'
    },
    symbol: {
      type: String,
      enum: ['KSh', '$', '€', '£'],
      default: 'KSh'
    },
    taxRate: {
      type: Number,
      default: 16,
      min: 0,
      max: 100
    },
    taxIncluded: {
      type: Boolean,
      default: false
    }
  },

  // Time & Date
  timezone: {
    type: String,
    default: 'Africa/Nairobi'
  },
  dateFormat: {
    type: String,
    enum: ['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'],
    default: 'dd/MM/yyyy'
  },
  timeFormat: {
    type: String,
    enum: ['12h', '24h'],
    default: '24h'
  },

  // Payment Settings
  paymentMethods: [{
    type: String,
    enum: ['mpesa', 'card', 'paypal', 'cash_on_delivery'],
    default: ['mpesa', 'card', 'cash_on_delivery']
  }],
  stripePublicKey: { type: String, default: '' },
  stripeSecretKey: { type: String, default: '' },
  mpesaShortCode: { type: String, default: '174379' },
  mpesaPasskey: { type: String, default: '' },
  mpesaConsumerKey: { type: String, default: '' },
  mpesaConsumerSecret: { type: String, default: '' },

  // Shipping Settings
  shippingMethods: [{
    type: String,
    enum: ['standard', 'express', 'pickup'],
    default: ['standard', 'express', 'pickup']
  }],
  standardShippingPrice: {
    type: Number,
    default: 200,
    min: 0
  },
  expressShippingPrice: {
    type: Number,
    default: 500,
    min: 0
  },
  freeShippingThreshold: {
    type: Number,
    default: 2000,
    min: 0
  },
  shippingZones: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    estimatedDays: { type: String, default: '3-5' }
  }],

  // Email Settings
  emailNotifications: { type: Boolean, default: true },
  orderConfirmation: { type: Boolean, default: true },
  shippingUpdates: { type: Boolean, default: true },
  promotionalEmails: { type: Boolean, default: false },
  adminNotifications: { type: Boolean, default: true },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUsername: { type: String, default: '' },
  smtpPassword: { type: String, default: '' },
  smtpFromEmail: { type: String, default: 'noreply@kwetushop.co.ke' },
  smtpFromName: { type: String, default: 'KwetuShop' },

  // Security Settings
  require2FA: { type: Boolean, default: false },
  sessionTimeout: { type: Number, default: 30 }, // minutes
  passwordPolicy: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  apiRateLimit: { type: Number, default: 100 },
  loginAttempts: { type: Number, default: 5 },
  maintenance: {
    isEnabled: { type: Boolean, default: false },
    message: { type: String, default: 'Site under maintenance' },
    allowedIps: [{ type: String }]
  },

  // SEO Settings
  metaTitle: {
    type: String,
    default: 'KwetuShop - Online Shopping in Kenya'
  },
  metaDescription: {
    type: String,
    default: 'Best online shopping in Kenya with quality products and fast delivery'
  },
  metaKeywords: [{
    type: String,
    default: ['online shopping', 'kenya', 'electronics', 'fashion', 'home']
  }],
  googleAnalyticsId: { type: String, default: '' },

  // Social Media
  socialMedia: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    whatsapp: { type: String, default: '' }
  },

  // Features
  features: {
    userRegistration: { type: Boolean, default: true },
    guestCheckout: { type: Boolean, default: true },
    multipleCurrencies: { type: Boolean, default: false },
    blog: { type: Boolean, default: true },
    deals: { type: Boolean, default: true },
    reviews: { type: Boolean, default: true },
    wishlist: { type: Boolean, default: true }
  },

  // Audit
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  version: { type: Number, default: 1 }
}, {
  timestamps: true
});

// Ensure only one document exists
globalSettingsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('GlobalSettings').countDocuments();
    if (count > 0) {
      return next(new Error('Only one global settings document can exist'));
    }
  }
  this.version += 1;
  next();
});

const GlobalSettings = mongoose.model('GlobalSettings', globalSettingsSchema);
export default GlobalSettings;