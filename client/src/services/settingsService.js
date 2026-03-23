// client/src/services/settingsService.js
import api from './client/api';

export const settingsService = {
  // Get public settings (no auth required)
  getPublicSettings: async () => {
    try {
      const response = await api.get('/public/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching public settings:', error);
      return {
        success: false,
        error: error.message,
        data: getDefaultSettings()
      };
    }
  },

  // Get user settings (requires auth)
  getUserSettings: async () => {
    try {
      const response = await api.get('/client/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Update user settings
  updateUserSettings: async (section, data) => {
    try {
      const endpoints = {
        profile: '/client/settings/profile',
        notifications: '/client/settings/notifications',
        display: '/client/settings/display',
        privacy: '/client/settings/privacy'
      };
      
      const endpoint = endpoints[section] || '/client/settings';
      const response = await api.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Reset user settings to default
  resetUserSettings: async () => {
    try {
      const response = await api.post('/client/settings/reset');
      return response.data;
    } catch (error) {
      console.error('Error resetting user settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Get specific setting groups
  getStoreInfo: async () => {
    try {
      const response = await api.get('/public/settings/store-info');
      return response.data;
    } catch (error) {
      console.error('Error fetching store info:', error);
      return { success: false, error: error.message };
    }
  },

  getThemeSettings: async () => {
    try {
      const response = await api.get('/public/settings/theme');
      return response.data;
    } catch (error) {
      console.error('Error fetching theme settings:', error);
      return { success: false, error: error.message };
    }
  },

  getCheckoutSettings: async () => {
    try {
      const response = await api.get('/public/settings/checkout');
      return response.data;
    } catch (error) {
      console.error('Error fetching checkout settings:', error);
      return { success: false, error: error.message };
    }
  },

  getProductDisplaySettings: async () => {
    try {
      const response = await api.get('/public/settings/product-display');
      return response.data;
    } catch (error) {
      console.error('Error fetching product display settings:', error);
      return { success: false, error: error.message };
    }
  },

  getLegalSettings: async () => {
    try {
      const response = await api.get('/public/settings/legal');
      return response.data;
    } catch (error) {
      console.error('Error fetching legal settings:', error);
      return { success: false, error: error.message };
    }
  },

  getShippingSettings: async () => {
    try {
      const response = await api.get('/public/settings/shipping');
      return response.data;
    } catch (error) {
      console.error('Error fetching shipping settings:', error);
      return { success: false, error: error.message };
    }
  },

  getCurrencyTaxSettings: async () => {
    try {
      const response = await api.get('/public/settings/currency-tax');
      return response.data;
    } catch (error) {
      console.error('Error fetching currency/tax settings:', error);
      return { success: false, error: error.message };
    }
  },

  getSeoSettings: async () => {
    try {
      const response = await api.get('/public/settings/seo');
      return response.data;
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      return { success: false, error: error.message };
    }
  }
};

function getDefaultSettings() {
  return {
    storeName: 'KwetuShop',
    storeEmail: 'info@kwetushop.co.ke',
    storePhone: '+254712345678',
    storeAddress: '123 Kimathi Street, Nairobi, Kenya',
    theme: 'dark',
    primaryColor: '#F59E0B',
    secondaryColor: '#EA580C',
    showAnnouncementBar: true,
    announcementText: 'Free shipping on orders over KSh 2000!',
    productsPerRow: 4,
    productsPerPage: 12,
    productDisplay: {
      showProductRating: true,
      showProductBadges: true,
      showDiscountBadge: true,
      showStockStatus: true,
      enableZoomOnHover: true,
      enableGalleryLightbox: true,
      showRelatedProducts: true,
      recentlyViewedCount: 4
    },
    checkoutSettings: {
      allowGuestCheckout: true,
      requirePhone: true,
      enableNotes: true,
      cartExpiryDays: 30
    },
    currency: 'KES',
    taxRate: 16,
    taxName: 'VAT',
    shippingMethods: ['standard', 'express', 'pickup'],
    standardShippingPrice: 200,
    expressShippingPrice: 500,
    freeShippingThreshold: 2000,
    paymentMethods: ['mpesa', 'card', 'cash_on_delivery']
  };
}