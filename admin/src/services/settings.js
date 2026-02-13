import api from './api';

export const settingsService = {
  // Get all settings
  getSettings: async () => {
    try {
      console.log('📤 Fetching settings from:', '/admin/settings/');
      // ✅ FIXED: Remove /api prefix
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
            // ✅ FIXED: Remove /api prefix
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

  // Update settings
  updateSettings: async (settingsData) => {
    try {
      console.log('📤 Updating settings:', settingsData);
      
      // ✅ FIXED: Remove /api prefix
      const response = await api.put('/admin/settings/', settingsData);
      console.log('✅ Update response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      
      if (error.response?.status === 404) {
        try {
          console.log('🔄 Trying without trailing slash...');
          // ✅ FIXED: Remove /api prefix
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
      // ✅ FIXED: Remove /api prefix
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
      // ✅ FIXED: Remove /api prefix
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
      // ✅ FIXED: Remove /api prefix
      const response = await api.put('/admin/settings/email', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating email settings:', error);
      throw error;
    }
  },

  // Get system info
  getSystemInfo: async () => {
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.get('/admin/settings/system-info');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching system info:', error);
      throw error;
    }
  },

  // Toggle maintenance mode
  toggleMaintenance: async (enabled, message) => {
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.patch('/admin/settings/maintenance', { 
        enabled: enabled,
        maintenanceMessage: message 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error toggling maintenance mode:', error);
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
      // ✅ FIXED: Remove /api prefix
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
          
          // ✅ FIXED: Remove /api prefix
          const altResponse = await api.post('/admin/upload/i/', formData, {
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

  // Test email
  testEmail: async () => {
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.get('/admin/settings/test');
      return response.data;
    } catch (error) {
      console.error('❌ Error testing email:', error);
      throw error;
    }
  },

  // Test auth
  testAuth: async () => {
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.get('/admin/settings/test-auth');
      return response.data;
    } catch (error) {
      console.error('❌ Error testing auth:', error);
      throw error;
    }
  },

  // Test connection
  testConnection: async () => {
    try {
      // ✅ FIXED: Remove /api prefix
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
          // ✅ FIXED: Remove /api prefix
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
        { method: 'GET', path: '/admin/settings/system-info' },
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

// Default settings
function getDefaultSettings() {
  return {
    storeName: 'KwetuShop',
    storeEmail: 'admin@kwetushop.co.ke',
    storePhone: '254712345678',
    storeAddress: '123 Kimathi Street, Nairobi, Kenya',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    storeLogo: '',
    paymentMethods: ['mpesa', 'card', 'cash_on_delivery'],
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    mpesaShortCode: '174379',
    mpesaPasskey: '',
    mpesaConsumerKey: '',
    mpesaConsumerSecret: '',
    mpesaTestMode: false,
    shippingMethods: ['standard', 'express', 'pickup'],
    standardShippingPrice: 200,
    expressShippingPrice: 500,
    freeShippingThreshold: 2000,
    shippingZones: [
      { name: 'Nairobi', price: 150 },
      { name: 'Mombasa', price: 300 },
      { name: 'Kisumu', price: 250 }
    ],
    emailNotifications: true,
    orderConfirmation: true,
    shippingUpdates: true,
    promotionalEmails: false,
    smsNotifications: true,
    adminNotifications: true,
    require2FA: false,
    sessionTimeout: 30,
    passwordPolicy: 'medium',
    apiRateLimit: 100,
    loginAttempts: 5,
    ipWhitelist: [],
    maintenanceMode: false,
    updatedAt: new Date().toISOString()
  };
}

export default settingsService;