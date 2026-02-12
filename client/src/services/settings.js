// src/services/settings.js
import api from './api';

export const settingsService = {
  // Get all settings
  getAllSettings: async () => {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  // Update settings
  updateSettings: async (settingsData) => {
    try {
      const response = await api.put('/admin/settings', settingsData);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  // Get general settings
  getGeneralSettings: async () => {
    try {
      const response = await api.get('/admin/settings/general');
      return response.data;
    } catch (error) {
      console.error('Error fetching general settings:', error);
      throw error;
    }
  },

  // Update general settings
  updateGeneralSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/general', data);
      return response.data;
    } catch (error) {
      console.error('Error updating general settings:', error);
      throw error;
    }
  },

  // Get store settings
  getStoreSettings: async () => {
    try {
      const response = await api.get('/admin/settings/store');
      return response.data;
    } catch (error) {
      console.error('Error fetching store settings:', error);
      throw error;
    }
  },

  // Update store settings
  updateStoreSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/store', data);
      return response.data;
    } catch (error) {
      console.error('Error updating store settings:', error);
      throw error;
    }
  },

  // Get shipping settings
  getShippingSettings: async () => {
    try {
      const response = await api.get('/admin/settings/shipping');
      return response.data;
    } catch (error) {
      console.error('Error fetching shipping settings:', error);
      throw error;
    }
  },

  // Update shipping settings
  updateShippingSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/shipping', data);
      return response.data;
    } catch (error) {
      console.error('Error updating shipping settings:', error);
      throw error;
    }
  },

  // Get tax settings
  getTaxSettings: async () => {
    try {
      const response = await api.get('/admin/settings/tax');
      return response.data;
    } catch (error) {
      console.error('Error fetching tax settings:', error);
      throw error;
    }
  },

  // Update tax settings
  updateTaxSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/tax', data);
      return response.data;
    } catch (error) {
      console.error('Error updating tax settings:', error);
      throw error;
    }
  },

  // Get email settings
  getEmailSettings: async () => {
    try {
      const response = await api.get('/admin/settings/email');
      return response.data;
    } catch (error) {
      console.error('Error fetching email settings:', error);
      throw error;
    }
  },

  // Update email settings
  updateEmailSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/email', data);
      return response.data;
    } catch (error) {
      console.error('Error updating email settings:', error);
      throw error;
    }
  },

  // Get payment settings
  getPaymentSettings: async () => {
    try {
      const response = await api.get('/admin/settings/payment');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      throw error;
    }
  },

  // Update payment settings
  updatePaymentSettings: async (data) => {
    try {
      const response = await api.put('/admin/settings/payment', data);
      return response.data;
    } catch (error) {
      console.error('Error updating payment settings:', error);
      throw error;
    }
  },

  // Upload settings file (logo, etc.)
  uploadFile: async (file, type = 'logo') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await api.post('/admin/settings/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
};