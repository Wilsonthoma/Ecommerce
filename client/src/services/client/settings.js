// src/services/client/settings.js - Complete Settings Service with LRU Cache
import clientApi from './api';
import { LRUCache } from '../../dataStructures/LRUCache';

// Create dedicated cache for settings
const settingsCache = new LRUCache(10); // Cache up to 10 settings collections

/**
 * Settings Service - Handles all user settings-related API calls
 * Endpoints: /api/settings/*
 */
class SettingsService {
  constructor() {
    this.pendingRequests = new Map(); // For deduplicating in-flight requests
  }

  /**
   * Deduplicate in-flight requests
   */
  async dedupeRequest(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      console.log('🔄 Reusing in-flight settings request:', key);
      return this.pendingRequests.get(key);
    }
    
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Get user profile settings (CACHED)
   */
  async getProfileSettings() {
    const cacheKey = 'user_profile_settings';
    
    // Check cache first
    const cached = settingsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Profile settings cache hit');
      return { ...cached, cached: true };
    }
    
    return await this.dedupeRequest(cacheKey, async () => {
      try {
        console.log('📤 Fetching profile settings...');
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Please login to view settings');
        }

        const response = await clientApi.get('/settings/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('📥 Profile settings response:', response.data);
        
        if (response.data?.success) {
          const result = {
            success: true,
            profile: response.data.profile || {}
          };
          
          settingsCache.put(cacheKey, result);
          
          return { ...result, cached: false };
        }
        
        return {
          success: false,
          profile: {},
          cached: false
        };
      } catch (error) {
        console.error('❌ Error fetching profile settings:', error);
        return {
          success: false,
          profile: {},
          error: error.response?.data?.message || error.message,
          cached: false
        };
      }
    });
  }

  /**
   * Update profile settings (NO CACHE - WRITE OPERATION)
   */
  async updateProfileSettings(profileData) {
    try {
      console.log('📤 Updating profile settings:', profileData);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to update settings');
      }

      const response = await clientApi.put('/settings/profile', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Update profile response:', response.data);
      
      // Clear profile cache
      settingsCache.put('user_profile_settings', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating profile settings:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to update settings');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to update profile');
      }
    }
  }

  /**
   * Get notification settings (CACHED)
   */
  async getNotificationSettings() {
    const cacheKey = 'user_notification_settings';
    
    const cached = settingsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Notification settings cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Fetching notification settings...');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to view settings');
      }

      const response = await clientApi.get('/settings/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const result = {
          success: true,
          notifications: response.data.notifications || {}
        };
        
        settingsCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        notifications: {},
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching notification settings:', error);
      return {
        success: false,
        notifications: {},
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Update notification settings (NO CACHE - WRITE OPERATION)
   */
  async updateNotificationSettings(notificationData) {
    try {
      console.log('📤 Updating notification settings:', notificationData);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to update settings');
      }

      const response = await clientApi.put('/settings/notifications', notificationData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Update notifications response:', response.data);
      
      // Clear notifications cache
      settingsCache.put('user_notification_settings', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating notification settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to update notifications');
    }
  }

  /**
   * Get privacy settings (CACHED)
   */
  async getPrivacySettings() {
    const cacheKey = 'user_privacy_settings';
    
    const cached = settingsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Privacy settings cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Fetching privacy settings...');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to view settings');
      }

      const response = await clientApi.get('/settings/privacy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const result = {
          success: true,
          privacy: response.data.privacy || {}
        };
        
        settingsCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        privacy: {},
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching privacy settings:', error);
      return {
        success: false,
        privacy: {},
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Update privacy settings (NO CACHE - WRITE OPERATION)
   */
  async updatePrivacySettings(privacyData) {
    try {
      console.log('📤 Updating privacy settings:', privacyData);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to update settings');
      }

      const response = await clientApi.put('/settings/privacy', privacyData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Update privacy response:', response.data);
      
      // Clear privacy cache
      settingsCache.put('user_privacy_settings', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating privacy settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to update privacy settings');
    }
  }

  /**
   * Get payment settings (CACHED)
   */
  async getPaymentSettings() {
    const cacheKey = 'user_payment_settings';
    
    const cached = settingsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Payment settings cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Fetching payment settings...');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to view settings');
      }

      const response = await clientApi.get('/settings/payment', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const result = {
          success: true,
          payment: response.data.payment || {}
        };
        
        settingsCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        payment: {},
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching payment settings:', error);
      return {
        success: false,
        payment: {},
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Update payment settings (NO CACHE - WRITE OPERATION)
   */
  async updatePaymentSettings(paymentData) {
    try {
      console.log('📤 Updating payment settings:', paymentData);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to update settings');
      }

      const response = await clientApi.put('/settings/payment', paymentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Update payment response:', response.data);
      
      // Clear payment cache
      settingsCache.put('user_payment_settings', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating payment settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to update payment settings');
    }
  }

  /**
   * Get shipping settings (CACHED)
   */
  async getShippingSettings() {
    const cacheKey = 'user_shipping_settings';
    
    const cached = settingsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Shipping settings cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Fetching shipping settings...');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to view settings');
      }

      const response = await clientApi.get('/settings/shipping', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const result = {
          success: true,
          shipping: response.data.shipping || {}
        };
        
        settingsCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        shipping: {},
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching shipping settings:', error);
      return {
        success: false,
        shipping: {},
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Update shipping settings (NO CACHE - WRITE OPERATION)
   */
  async updateShippingSettings(shippingData) {
    try {
      console.log('📤 Updating shipping settings:', shippingData);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to update settings');
      }

      const response = await clientApi.put('/settings/shipping', shippingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Update shipping response:', response.data);
      
      // Clear shipping cache
      settingsCache.put('user_shipping_settings', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating shipping settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to update shipping settings');
    }
  }

  /**
   * Get all settings at once (CACHED)
   */
  async getAllSettings() {
    const cacheKey = 'user_all_settings';
    
    const cached = settingsCache.get(cacheKey);
    if (cached) {
      console.log('✅ All settings cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Fetching all settings...');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to view settings');
      }

      const response = await clientApi.get('/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const result = {
          success: true,
          settings: response.data.settings || {}
        };
        
        settingsCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        settings: {},
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching all settings:', error);
      return {
        success: false,
        settings: {},
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Change password (NO CACHE - WRITE OPERATION)
   */
  async changePassword(passwordData) {
    try {
      console.log('📤 Changing password...');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to change password');
      }

      const response = await clientApi.post('/settings/change-password', passwordData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Change password response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error changing password:', error);
      
      if (error.response?.status === 400) {
        const msg = error.response.data?.message || '';
        if (msg.includes('current password')) {
          throw new Error('Current password is incorrect');
        } else if (msg.includes('same')) {
          throw new Error('New password cannot be the same as current password');
        }
      }
      
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }

  /**
   * Delete account (NO CACHE - WRITE OPERATION)
   */
  async deleteAccount(password) {
    try {
      console.log('📤 Deleting account...');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to delete account');
      }

      const response = await clientApi.delete('/settings/account', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: { password }
      });
      
      console.log('📥 Delete account response:', response.data);
      
      // Clear all caches
      this.clearAllCaches();
      
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting account:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Password is incorrect');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  }

  /**
   * Clear all settings caches
   */
  clearAllCaches() {
    settingsCache.clear();
    console.log('🗑️ All settings caches cleared');
  }
}

// Create and export a singleton instance
export const clientSettingsService = new SettingsService();

export default clientSettingsService;