import mongoose from 'mongoose';

const globalSettingsSchema = new mongoose.Schema({
  // Store Information
  storeName: {
    type: String,
    default: 'KwetuShop',
    trim: true
  },
  storeEmail: {
    type: String,
    default: 'admin@kwetushop.co.ke',
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  storePhone: {
    type: String,
    default: '+254712345678'
  },
  storeAddress: {
    type: String,
    default: '123 Kimathi Street, Nairobi, Kenya'
  },
  storeLogo: {
    type: String,
    default: ''
  },
  favicon: {
    type: String,
    default: ''
  },
  storeDescription: {
    type: String,
    default: 'Your trusted electronics store in Kenya'
  },
  storeKeywords: {
    type: String,
    default: 'electronics, smartphones, laptops, tablets, Kenya'
  },
  enableWhatsApp: {
    type: Boolean,
    default: true
  },
  whatsappNumber: {
    type: String,
    default: '+254712345678'
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    whatsapp: { type: String, default: '' }
  },

  // Currency & Tax
  currency: {
    type: String,
    enum: ['KES', 'USD', 'EUR', 'GBP'],
    default: 'KES'
  },
  timezone: {
    type: String,
    default: 'Africa/Nairobi'
  },

  // Customer Account Settings
  customerSettings: {
    allowRegistration: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: true },
    requirePhoneVerification: { type: Boolean, default: false },
    enableSocialLogin: { type: Boolean, default: false },
    socialLoginProviders: [{ type: String, default: [] }],
    enableWishlist: { type: Boolean, default: true },
    enableReviews: { type: Boolean, default: true },
    enableOrderTracking: { type: Boolean, default: true },
    enableReturns: { type: Boolean, default: true },
    returnsWindowDays: { type: Number, default: 14 },
    enableSavedAddresses: { type: Boolean, default: true }
  },

  // Product Display Settings
  productDisplay: {
    showProductRating: { type: Boolean, default: true },
    showProductBadges: { type: Boolean, default: true },
    showDiscountBadge: { type: Boolean, default: true },
    showStockStatus: { type: Boolean, default: true },
    enableZoomOnHover: { type: Boolean, default: true },
    enableGalleryLightbox: { type: Boolean, default: true },
    showRelatedProducts: { type: Boolean, default: true },
    recentlyViewedCount: { type: Number, default: 4 }
  },

  // Checkout Settings
  checkoutSettings: {
    allowGuestCheckout: { type: Boolean, default: true },
    requirePhone: { type: Boolean, default: true },
    requireCompany: { type: Boolean, default: false },
    enableNotes: { type: Boolean, default: true },
    cartExpiryDays: { type: Number, default: 30 }
  },

  // Email Templates
  emailTemplates: {
    fromEmail: { type: String, default: 'noreply@kwetushop.co.ke' },
    fromName: { type: String, default: 'KwetuShop' },
    replyToEmail: { type: String, default: 'support@kwetushop.co.ke' },
    welcomeEmailSubject: { type: String, default: 'Welcome to KwetuShop!' },
    welcomeEmailBody: { type: String, default: 'Thank you for joining KwetuShop!' },
    orderConfirmationSubject: { type: String, default: 'Order #{orderNumber} Confirmed' },
    orderConfirmationBody: { type: String, default: 'Your order has been received.' },
    shippingUpdateSubject: { type: String, default: 'Your order #{orderNumber} has shipped' },
    shippingUpdateBody: { type: String, default: 'Your order is on its way!' },
    resetPasswordSubject: { type: String, default: 'Password Reset Request' },
    resetPasswordBody: { type: String, default: 'Click the link below to reset your password.' },
    emailFooterText: { type: String, default: 'Thank you for shopping with KwetuShop' },
    emailFooterSocial: { type: Boolean, default: true },
    emailUnsubscribeLink: { type: Boolean, default: true }
  },

  // SMS Templates
  smsTemplates: {
    smsProvider: { type: String, default: 'africastalking' },
    smsApiKey: { type: String, default: '' },
    smsApiSecret: { type: String, default: '' },
    smsSenderId: { type: String, default: 'KwetuShop' },
    orderConfirmationSms: { type: String, default: 'Order #{orderNumber} confirmed. KSh{amount}. Thank you!' },
    shippingUpdateSms: { type: String, default: 'Order #{orderNumber} shipped. Track: {tracking}' },
    deliveryNotificationSms: { type: String, default: 'Your order has been delivered!' },
    welcomeSms: { type: String, default: 'Welcome to KwetuShop!' },
    otpSms: { type: String, default: 'Your verification code is: {code}' },
    smsNotifications: { type: Boolean, default: true }
  },

  // Legal & Compliance
  legalSettings: {
    termsOfServiceUrl: { type: String, default: '/terms' },
    privacyPolicyUrl: { type: String, default: '/privacy' },
    refundPolicyUrl: { type: String, default: '/refund-policy' },
    shippingPolicyUrl: { type: String, default: '/shipping-policy' },
    enableCookieConsent: { type: Boolean, default: true },
    cookieConsentMessage: { type: String, default: 'We use cookies to enhance your experience.' },
    enableGdpr: { type: Boolean, default: true },
    dataRetentionDays: { type: Number, default: 365 },
    allowDataExport: { type: Boolean, default: true },
    allowAccountDeletion: { type: Boolean, default: true },
    ageRestricted: { type: Boolean, default: false },
    minimumAge: { type: Number, default: 18 }
  },

  // Payment Display
  paymentDisplay: {
    showPaymentIcons: { type: Boolean, default: true },
    paymentIcons: [{ type: String, default: ['visa', 'mastercard', 'mpesa', 'airtel'] }],
    acceptedCards: [{ type: String, default: ['visa', 'mastercard', 'amex'] }],
    securePaymentMessage: { type: String, default: 'Your payment information is secure' },
    installmentMessage: { type: String, default: 'Pay in installments from KSh 500/month' }
  },

  // SEO & Marketing
  seoSettings: {
    metaTitle: { type: String, default: 'KwetuShop - Best Electronics Store in Kenya' },
    metaDescription: { type: String, default: 'Shop the latest smartphones, laptops, and electronics.' },
    metaKeywords: { type: String, default: 'electronics, smartphones, laptops, Kenya' },
    robotsTxt: { type: String, default: 'User-agent: *\nAllow: /' },
    sitemapEnabled: { type: Boolean, default: true },
    googleAnalyticsId: { type: String, default: '' },
    facebookPixelId: { type: String, default: '' },
    enableEnhancedEcommerce: { type: Boolean, default: true },
    ogImage: { type: String, default: '' },
    twitterCard: { type: String, default: 'summary_large_image' },
    enableSocialShare: { type: Boolean, default: true },
    enableAnalytics: { type: Boolean, default: true },
    trackPurchases: { type: Boolean, default: true }
  },

  // Payment Settings
  paymentMethods: [{
    type: String,
    enum: ['mpesa', 'card', 'cash_on_delivery', 'bank_transfer'],
    default: ['mpesa', 'card', 'cash_on_delivery']
  }],
  stripePublicKey: { type: String, default: '' },
  stripeSecretKey: { type: String, default: '' },
  stripeWebhookSecret: { type: String, default: '' },
  mpesaShortCode: { type: String, default: '174379' },
  mpesaPasskey: { type: String, default: '' },
  mpesaConsumerKey: { type: String, default: '' },
  mpesaConsumerSecret: { type: String, default: '' },
  mpesaTestMode: { type: Boolean, default: false },

  // Shipping Settings
  shippingMethods: [{
    type: String,
    enum: ['standard', 'express', 'pickup'],
    default: ['standard', 'express', 'pickup']
  }],
  standardShippingPrice: { type: Number, default: 200 },
  expressShippingPrice: { type: Number, default: 500 },
  freeShippingThreshold: { type: Number, default: 2000 },
  shippingZones: [{
    name: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  processingTimeDays: { type: Number, default: 1 },
  standardDeliveryDays: {
    min: { type: Number, default: 3 },
    max: { type: Number, default: 5 }
  },
  expressDeliveryDays: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 2 }
  },
  freeShippingMessage: { type: String, default: 'Free shipping on orders over KSh 2000!' },
  estimatedDeliveryMessage: { type: String, default: 'Estimated delivery: {min}-{max} days' },
  enableOrderTracking: { type: Boolean, default: true },
  trackingUrl: { type: String, default: 'https://track.courier.com/{trackingNumber}' },
  sendTrackingEmail: { type: Boolean, default: true },

  // Notification Settings
  emailNotifications: { type: Boolean, default: true },
  orderConfirmation: { type: Boolean, default: true },
  shippingUpdates: { type: Boolean, default: true },
  promotionalEmails: { type: Boolean, default: false },
  smsNotifications: { type: Boolean, default: true },
  adminNotifications: { type: Boolean, default: true },

  // Security Settings
  require2FA: { type: Boolean, default: false },
  sessionTimeout: { type: Number, default: 30 },
  passwordPolicy: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  apiRateLimit: { type: Number, default: 100 },
  loginAttempts: { type: Number, default: 5 },
  ipWhitelist: [{ type: String, default: [] }],

  // Maintenance
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: 'We are currently undergoing maintenance. Please check back soon.' },

  // Tax Settings
  taxRate: { type: Number, default: 16 },
  taxName: { type: String, default: 'VAT' },
  taxInclusive: { type: Boolean, default: true },
  taxableProducts: { type: Boolean, default: true },
  taxShipping: { type: Boolean, default: false },

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