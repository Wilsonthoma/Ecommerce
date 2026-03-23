import api from './api';

export const settingsService = {
  // Get all settings
  getSettings: async () => {
    try {
      console.log('📤 Fetching settings from:', '/admin/settings/');
      const response = await api.get('/admin/settings/');
      console.log('✅ Settings raw response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      
      if (error.response?.status === 404) {
        console.warn('⚠️ Settings endpoint returned 404. Trying alternative endpoints...');
        
        const alternativeEndpoints = [
          '/admin/settings',
          '/settings/',
          '/settings'
        ];
        
        for (const endpoint of alternativeEndpoints) {
          try {
            console.log(`🔄 Trying alternative endpoint: ${endpoint}`);
            const altResponse = await api.get(endpoint);
            console.log(`✅ Success with endpoint: ${endpoint}`, altResponse.data);
            return altResponse.data;
          } catch (altError) {
            console.log(`❌ Failed with ${endpoint}: ${altError.response?.status || altError.message}`);
          }
        }
      }
      
      console.log('📝 Returning default settings');
      return {
        success: false,
        message: 'Failed to fetch settings. Using defaults.',
        data: getDefaultSettings()
      };
    }
  },

  // Update all settings
  updateSettings: async (settingsData) => {
    try {
      console.log('📤 Updating settings:', settingsData);
      const response = await api.put('/admin/settings/', settingsData);
      console.log('✅ Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      
      if (error.response?.status === 404) {
        try {
          console.log('🔄 Trying without trailing slash...');
          const response = await api.put('/admin/settings', settingsData);
          return response.data;
        } catch (secondError) {
          throw secondError;
        }
      }
      throw error;
    }
  },

  // Reset settings
  resetSettings: async () => {
    try {
      console.log('📤 Resetting settings...');
      const response = await api.post('/admin/settings/reset');
      console.log('✅ Reset response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error resetting settings:', error);
      throw error;
    }
  },

  // Get email settings
  getEmailSettings: async () => {
    try {
      const response = await api.get('/admin/settings/email');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching email settings:', error);
      throw error;
    }
  },

  // Update email settings
  updateEmailSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/email', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating email settings:', error);
      throw error;
    }
  },

  // Get SMS settings
  getSmsSettings: async () => {
    try {
      const response = await api.get('/admin/settings/sms');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching SMS settings:', error);
      return { success: false, data: getDefaultSettings().smsTemplates };
    }
  },

  // Update SMS settings
  updateSmsSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/sms', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating SMS settings:', error);
      throw error;
    }
  },

  // Get legal settings
  getLegalSettings: async () => {
    try {
      const response = await api.get('/admin/settings/legal');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching legal settings:', error);
      return { success: false, data: getDefaultSettings().legal };
    }
  },

  // Update legal settings
  updateLegalSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/legal', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating legal settings:', error);
      throw error;
    }
  },

  // Get product display settings
  getProductDisplaySettings: async () => {
    try {
      const response = await api.get('/admin/settings/product-display');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching product display settings:', error);
      return { success: false, data: getDefaultSettings().productDisplay };
    }
  },

  // Update product display settings
  updateProductDisplaySettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/product-display', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating product display settings:', error);
      throw error;
    }
  },

  // Get checkout settings
  getCheckoutSettings: async () => {
    try {
      const response = await api.get('/admin/settings/checkout');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching checkout settings:', error);
      return { success: false, data: getDefaultSettings().checkout };
    }
  },

  // Update checkout settings
  updateCheckoutSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/checkout', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating checkout settings:', error);
      throw error;
    }
  },

  // Get customer account settings
  getCustomerSettings: async () => {
    try {
      const response = await api.get('/admin/settings/customer');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching customer settings:', error);
      return { success: false, data: getDefaultSettings().customer };
    }
  },

  // Update customer account settings
  updateCustomerSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/customer', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating customer settings:', error);
      throw error;
    }
  },

  // Get theme settings
  getThemeSettings: async () => {
    try {
      const response = await api.get('/admin/settings/theme');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching theme settings:', error);
      return { success: false, data: getDefaultSettings().theme };
    }
  },

  // Update theme settings
  updateThemeSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/theme', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating theme settings:', error);
      throw error;
    }
  },

  // Get payment display settings
  getPaymentDisplaySettings: async () => {
    try {
      const response = await api.get('/admin/settings/payment-display');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching payment display settings:', error);
      return { success: false, data: getDefaultSettings().paymentDisplay };
    }
  },

  // Update payment display settings
  updatePaymentDisplaySettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/payment-display', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating payment display settings:', error);
      throw error;
    }
  },

  // Get SEO settings
  getSeoSettings: async () => {
    try {
      const response = await api.get('/admin/settings/seo');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching SEO settings:', error);
      return { success: false, data: getDefaultSettings().seo };
    }
  },

  // Update SEO settings
  updateSeoSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/seo', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating SEO settings:', error);
      throw error;
    }
  },

  // Upload file
  uploadFile: async (file, type = 'logo') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (type) {
        formData.append('type', type);
      }

      console.log('📤 Uploading file...');
      const response = await api.post('/admin/settings/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      
      if (error.response?.status === 404) {
        try {
          console.log('🔄 Trying alternative upload endpoint...');
          const formData = new FormData();
          formData.append('file', file);
          if (type) formData.append('type', type);
          
          const altResponse = await api.post('/admin/upload/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          return altResponse.data;
        } catch (altError) {
          throw altError;
        }
      }
      throw error;
    }
  },

  // Test SMS
  testSms: async (phoneNumber, message) => {
    try {
      const response = await api.post('/admin/settings/test-sms', { phoneNumber, message });
      return response.data;
    } catch (error) {
      console.error('❌ Error testing SMS:', error);
      throw error;
    }
  },

  // Test email
  testEmail: async (email) => {
    try {
      const response = await api.post('/admin/settings/test-email', { email });
      return response.data;
    } catch (error) {
      console.error('❌ Error testing email:', error);
      throw error;
    }
  },

  // Test M-Pesa connection
  testMpesa: async () => {
    try {
      const response = await api.post('/admin/settings/test-mpesa');
      return response.data;
    } catch (error) {
      console.error('❌ Error testing M-Pesa:', error);
      throw error;
    }
  },

  // Test Stripe connection
  testStripe: async () => {
    try {
      const response = await api.post('/admin/settings/test-stripe');
      return response.data;
    } catch (error) {
      console.error('❌ Error testing Stripe:', error);
      throw error;
    }
  },

  // Test connection
  testConnection: async () => {
    try {
      const response = await api.get('/admin/settings/');
      return {
        success: true,
        message: 'Settings endpoint is accessible',
        data: response.data,
        endpoint: '/admin/settings/'
      };
    } catch (error) {
      const endpoints = [
        '/admin/settings',
        '/settings/',
        '/settings',
        '/admin/settings/test',
        '/admin/settings/test-auth'
      ];
      
      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          results.push({
            endpoint,
            success: true,
            status: response.status,
            data: response.data
          });
        } catch (endpointError) {
          results.push({
            endpoint,
            success: false,
            status: endpointError.response?.status,
            error: endpointError.message
          });
        }
      }
      
      return {
        success: false,
        message: 'Settings endpoint test failed',
        error: error.message,
        results: results
      };
    }
  },

  // Get all available endpoints for debugging
  getAvailableEndpoints: async () => {
    try {
      const endpointsToTest = [
        { method: 'GET', path: '/admin/settings/' },
        { method: 'GET', path: '/admin/settings' },
        { method: 'GET', path: '/admin/settings/test' },
        { method: 'GET', path: '/admin/settings/test-auth' },
        { method: 'GET', path: '/admin/settings/email' },
        { method: 'GET', path: '/admin/settings/sms' },
        { method: 'GET', path: '/admin/settings/legal' },
        { method: 'GET', path: '/admin/settings/product-display' },
        { method: 'GET', path: '/admin/settings/checkout' },
        { method: 'GET', path: '/admin/settings/customer' },
        { method: 'GET', path: '/admin/settings/theme' },
        { method: 'GET', path: '/admin/settings/payment-display' },
        { method: 'GET', path: '/admin/settings/seo' },
        { method: 'GET', path: '/admin/products/' },
        { method: 'GET', path: '/admin/orders/' },
        { method: 'GET', path: '/health' }
      ];
      
      const results = await Promise.all(
        endpointsToTest.map(async ({ method, path }) => {
          try {
            const response = await api({
              method,
              url: path,
              validateStatus: () => true
            });
            return {
              endpoint: `${method} ${path}`,
              success: response.status >= 200 && response.status < 300,
              status: response.status,
              data: response.data
            };
          } catch (error) {
            return {
              endpoint: `${method} ${path}`,
              success: false,
              status: error.response?.status,
              error: error.message
            };
          }
        })
      );
      
      return {
        success: true,
        message: 'Endpoint test completed',
        results: results
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to test endpoints',
        error: error.message
      };
    }
  }
};

// Complete default settings
function getDefaultSettings() {
  return {
    // ========== GENERAL SETTINGS ==========
    storeName: 'KwetuShop',
    storeEmail: 'admin@kwetushop.co.ke',
    storePhone: '+254712345678',
    storeAddress: '123 Kimathi Street, Nairobi, Kenya',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    storeLogo: '',
    favicon: '',
    storeDescription: 'Your trusted electronics store in Kenya',
    storeKeywords: 'electronics, smartphones, laptops, tablets, Kenya',
    enableWhatsApp: true,
    whatsappNumber: '+254712345678',
    socialLinks: {
      facebook: 'https://facebook.com/kwetushop',
      twitter: 'https://twitter.com/kwetushop',
      instagram: 'https://instagram.com/kwetushop',
      youtube: '',
      linkedin: '',
      whatsapp: 'https://wa.me/254712345678'
    },
    
    // ========== THEME & APPEARANCE ==========
    theme: 'dark',
    primaryColor: '#F59E0B',
    secondaryColor: '#EA580C',
    accentColor: '#10B981',
    headerLayout: 'centered',
    showAnnouncementBar: true,
    announcementText: 'Free shipping on orders over KSh 2000!',
    enableQuickView: true,
    productsPerRow: 4,
    productsPerPage: 12,
    showOutOfStock: false,
    lowStockThreshold: 5,
    
    // ========== CUSTOMER ACCOUNTS ==========
    customer: {
      allowRegistration: true,
      requireEmailVerification: true,
      requirePhoneVerification: false,
      enableSocialLogin: false,
      socialLoginProviders: ['google', 'facebook'],
      enableWishlist: true,
      enableReviews: true,
      enableOrderTracking: true,
      enableReturns: true,
      returnsWindowDays: 14,
      enableSavedAddresses: true
    },
    
    // ========== PRODUCT DISPLAY ==========
    productDisplay: {
      showProductRating: true,
      showProductBadges: true,
      showDiscountBadge: true,
      showStockStatus: true,
      enableZoomOnHover: true,
      enableGalleryLightbox: true,
      showRelatedProducts: true,
      recentlyViewedCount: 4,
      showSKU: false,
      showVendor: true,
      enableProductVideos: false
    },
    
    // ========== CHECKOUT SETTINGS ==========
    checkout: {
      allowGuestCheckout: true,
      requirePhone: true,
      requireCompany: false,
      enableNotes: true,
      cartExpiryDays: 30
    },
    
    // ========== EMAIL TEMPLATES ==========
    emailTemplates: {
      fromEmail: 'noreply@kwetushop.co.ke',
      fromName: 'KwetuShop',
      replyToEmail: 'support@kwetushop.co.ke',
      welcomeEmailSubject: 'Welcome to KwetuShop!',
      welcomeEmailBody: 'Thank you for joining KwetuShop. We\'re excited to have you on board!',
      orderConfirmationSubject: 'Order #{orderNumber} Confirmed',
      orderConfirmationBody: 'Your order has been received and is being processed.',
      shippingUpdateSubject: 'Your order #{orderNumber} has shipped',
      shippingUpdateBody: 'Your order is on its way! Track your package here.',
      resetPasswordSubject: 'Password Reset Request',
      resetPasswordBody: 'Click the link below to reset your password.',
      emailFooterText: 'Thank you for shopping with KwetuShop',
      emailFooterSocial: true,
      emailUnsubscribeLink: true
    },
    
    // ========== SMS TEMPLATES ==========
    smsTemplates: {
      smsProvider: 'africastalking',
      smsApiKey: '',
      smsApiSecret: '',
      smsSenderId: 'KwetuShop',
      orderConfirmationSms: 'Order #{orderNumber} confirmed. KSh{amount}. Thank you!',
      shippingUpdateSms: 'Order #{orderNumber} shipped. Track: {tracking}',
      deliveryNotificationSms: 'Your order has been delivered! Enjoy your purchase.',
      welcomeSms: 'Welcome to KwetuShop! Enjoy shopping with us.',
      otpSms: 'Your verification code is: {code}',
      smsNotifications: true
    },
    
    // ========== LEGAL & COMPLIANCE ==========
    legal: {
      termsOfServiceUrl: '/terms',
      privacyPolicyUrl: '/privacy',
      refundPolicyUrl: '/refund-policy',
      shippingPolicyUrl: '/shipping-policy',
      enableCookieConsent: true,
      cookieConsentMessage: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
      enableGdpr: true,
      dataRetentionDays: 365,
      allowDataExport: true,
      allowAccountDeletion: true,
      ageRestricted: false,
      minimumAge: 18
    },
    
    // ========== PAYMENT DISPLAY ==========
    paymentDisplay: {
      showPaymentIcons: true,
      paymentIcons: ['visa', 'mastercard', 'mpesa', 'airtel'],
      acceptedCards: ['visa', 'mastercard', 'amex'],
      securePaymentMessage: 'Your payment information is secure',
      installmentMessage: 'Pay in installments from KSh 500/month'
    },
    
    // ========== SEO & MARKETING ==========
    seo: {
      metaTitle: 'KwetuShop - Best Electronics Store in Kenya',
      metaDescription: 'Shop the latest smartphones, laptops, and electronics at KwetuShop. Free delivery in Nairobi. Best prices guaranteed!',
      metaKeywords: 'electronics, smartphones, laptops, tablets, Kenya, Nairobi',
      robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /cart/\nDisallow: /checkout/',
      sitemapEnabled: true,
      googleAnalyticsId: '',
      facebookPixelId: '',
      enableEnhancedEcommerce: true,
      ogImage: '',
      twitterCard: 'summary_large_image',
      enableSocialShare: true,
      enableAnalytics: true,
      trackPurchases: true
    },
    
    // ========== SHIPPING SETTINGS ==========
    shippingMethods: ['standard', 'express', 'pickup'],
    standardShippingPrice: 200,
    expressShippingPrice: 500,
    freeShippingThreshold: 2000,
    shippingZones: [
      { name: 'Nairobi', price: 150 },
      { name: 'Mombasa', price: 300 },
      { name: 'Kisumu', price: 250 }
    ],
    processingTimeDays: 1,
    standardDeliveryDays: { min: 3, max: 5 },
    expressDeliveryDays: { min: 1, max: 2 },
    freeShippingMessage: 'Free shipping on orders over KSh 2000!',
    estimatedDeliveryMessage: 'Estimated delivery: {min}-{max} days',
    enableOrderTracking: true,
    trackingUrl: 'https://track.courier.com/{trackingNumber}',
    sendTrackingEmail: true,
    
    // ========== PAYMENT SETTINGS ==========
    paymentMethods: ['mpesa', 'card', 'cash_on_delivery'],
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    mpesaShortCode: '174379',
    mpesaPasskey: '',
    mpesaConsumerKey: '',
    mpesaConsumerSecret: '',
    mpesaTestMode: false,
    
    // ========== NOTIFICATION SETTINGS ==========
    emailNotifications: true,
    orderConfirmation: true,
    shippingUpdates: true,
    promotionalEmails: false,
    adminNotifications: true,
    
    // ========== SECURITY SETTINGS ==========
    require2FA: false,
    sessionTimeout: 30,
    passwordPolicy: 'medium',
    apiRateLimit: 100,
    loginAttempts: 5,
    ipWhitelist: [],
    
    // ========== MAINTENANCE ==========
    maintenanceMode: false,
    maintenanceMessage: 'We are currently undergoing maintenance. Please check back soon.',
    
    // ========== TAX SETTINGS ==========
    taxRate: 16,
    taxName: 'VAT',
    taxInclusive: true,
    taxableProducts: true,
    taxShipping: false,
    
    // ========== METADATA ==========
    updatedAt: new Date().toISOString()
  };
}

export default settingsService;