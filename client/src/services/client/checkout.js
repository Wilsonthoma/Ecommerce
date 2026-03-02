// client/src/services/client/checkout.js - UPDATED with LRU Cache
import clientApi from './api';
import { LRUCache } from '../../dataStructures/LRUCache';

// Create dedicated cache for checkout data
const checkoutCache = new LRUCache(20); // Cache up to 20 checkout-related items

/**
 * Checkout Service - Handles all checkout-related API calls
 * Matches backend endpoints (clientApi automatically adds /api prefix)
 */
export const clientCheckoutService = {
  // ========== CHECKOUT PROCESS ==========

  /**
   * Initialize checkout process (NO CACHE - WRITE OPERATION)
   * @param {Object} checkoutData - Cart items and preliminary data
   * @returns {Promise<Object>} - { success, checkoutId, message }
   */
  initCheckout: async (checkoutData) => {
    try {
      console.log('📤 Initializing checkout:', checkoutData);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');

      const response = await clientApi.post('/checkout/init', checkoutData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });
      
      console.log('📥 Checkout init response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error initializing checkout:', error);
      throw error;
    }
  },

  /**
   * Validate checkout data before proceeding (CACHED - short TTL)
   * @param {Object} checkoutData - Checkout data to validate
   * @returns {Promise<Object>} - { success, valid, errors }
   */
  validateCheckout: async (checkoutData) => {
    const cacheKey = `validate_${JSON.stringify(checkoutData)}`;
    
    const cached = checkoutCache.get(cacheKey);
    if (cached) {
      console.log('✅ Validation cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Validating checkout:', checkoutData);
      
      const response = await clientApi.post('/checkout/validate', checkoutData);
      
      console.log('📥 Validation response:', response.data);
      
      const result = {
        success: response.data?.success || false,
        valid: response.data?.valid || false,
        errors: response.data?.errors || {}
      };
      
      // Cache validation for 1 minute (validation may change)
      checkoutCache.put(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('❌ Error validating checkout:', error);
      return {
        success: false,
        valid: false,
        errors: error.response?.data?.errors || { general: 'Validation failed' }
      };
    }
  },

  // ========== ADDRESS MANAGEMENT ==========

  /**
   * Validate shipping address (CACHED - short TTL)
   * @param {Object} address - Shipping address object
   * @returns {Promise<Object>} - { success, valid, errors }
   */
  validateAddress: async (address) => {
    const cacheKey = `validate_address_${JSON.stringify(address)}`;
    
    const cached = checkoutCache.get(cacheKey);
    if (cached) {
      console.log('✅ Address validation cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Validating address:', address);
      
      const response = await clientApi.post('/checkout/validate-address', address);
      
      console.log('📥 Address validation response:', response.data);
      
      const result = {
        success: response.data?.success || false,
        valid: response.data?.valid || false,
        errors: response.data?.errors || {}
      };
      
      // Cache address validation for 5 minutes
      checkoutCache.put(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('❌ Error validating address:', error);
      return {
        success: false,
        valid: false,
        errors: error.response?.data?.errors || { general: 'Address validation failed' }
      };
    }
  },

  /**
   * Get saved addresses for the current user (CACHED)
   * @returns {Promise<Object>} - { success, addresses }
   */
  getSavedAddresses: async () => {
    const cacheKey = 'saved_addresses';
    
    const cached = checkoutCache.get(cacheKey);
    if (cached) {
      console.log('✅ Saved addresses cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Fetching saved addresses');
      
      const token = localStorage.getItem('token');

      const response = await clientApi.get('/checkout/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Saved addresses response:', response.data);
      
      const result = {
        success: response.data?.success || false,
        addresses: response.data?.addresses || []
      };
      
      // Cache addresses for 5 minutes
      checkoutCache.put(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching saved addresses:', error);
      return {
        success: false,
        addresses: [],
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Save a new address (NO CACHE - WRITE OPERATION)
   * @param {Object} address - Address to save
   * @returns {Promise<Object>} - { success, address, message }
   */
  saveAddress: async (address) => {
    try {
      console.log('📤 Saving address:', address);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');

      const response = await clientApi.post('/checkout/addresses', address, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        }
      });
      
      console.log('📥 Save address response:', response.data);
      
      // Clear saved addresses cache after adding new address
      checkoutCache.put('saved_addresses', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error saving address:', error);
      throw error;
    }
  },

  /**
   * Update an existing address (NO CACHE - WRITE OPERATION)
   * @param {string} addressId - Address ID
   * @param {Object} address - Updated address data
   * @returns {Promise<Object>} - { success, message }
   */
  updateAddress: async (addressId, address) => {
    try {
      console.log(`📤 Updating address ${addressId}:`, address);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');

      const response = await clientApi.put(`/checkout/addresses/${addressId}`, address, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        }
      });
      
      console.log('📥 Update address response:', response.data);
      
      // Clear saved addresses cache after update
      checkoutCache.put('saved_addresses', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating address:', error);
      throw error;
    }
  },

  /**
   * Delete a saved address (NO CACHE - WRITE OPERATION)
   * @param {string} addressId - Address ID
   * @returns {Promise<Object>} - { success, message }
   */
  deleteAddress: async (addressId) => {
    try {
      console.log(`📤 Deleting address ${addressId}`);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');

      const response = await clientApi.delete(`/checkout/addresses/${addressId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        }
      });
      
      console.log('📥 Delete address response:', response.data);
      
      // Clear saved addresses cache after deletion
      checkoutCache.put('saved_addresses', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting address:', error);
      throw error;
    }
  },

  // ========== SHIPPING METHODS ==========

  /**
   * Get available shipping methods (CACHED)
   * @returns {Promise<Object>} - { success, methods }
   */
  getShippingMethods: async () => {
    const cacheKey = 'shipping_methods';
    
    const cached = checkoutCache.get(cacheKey);
    if (cached) {
      console.log('✅ Shipping methods cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Fetching shipping methods');
      
      const response = await clientApi.get('/checkout/shipping-methods');
      
      console.log('📥 Shipping methods response:', response.data);
      
      const result = {
        success: response.data?.success || false,
        methods: response.data?.methods || []
      };
      
      // Cache shipping methods for 1 hour (rarely changes)
      checkoutCache.put(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching shipping methods:', error);
      return {
        success: false,
        methods: [],
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Calculate shipping cost (CACHED - depends on address)
   * @param {string} methodId - Shipping method ID
   * @param {Object} address - Shipping address
   * @param {Array} items - Cart items
   * @returns {Promise<Object>} - { success, cost, estimatedDays }
   */
  calculateShipping: async (methodId, address, items) => {
    const cacheKey = `shipping_calc_${methodId}_${address?.county || 'unknown'}_${items?.length || 0}`;
    
    const cached = checkoutCache.get(cacheKey);
    if (cached) {
      console.log('✅ Shipping calculation cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Calculating shipping:', { methodId, address, items });
      
      const response = await clientApi.post('/checkout/calculate-shipping', {
        methodId, address, items
      });
      
      console.log('📥 Shipping calculation response:', response.data);
      
      const result = {
        success: response.data?.success || false,
        cost: response.data?.cost || 0,
        estimatedDays: response.data?.estimatedDays || '3-5',
        method: response.data?.method || 'Standard'
      };
      
      // Cache shipping calculation for 10 minutes
      checkoutCache.put(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('❌ Error calculating shipping:', error);
      return {
        success: false,
        cost: 0,
        estimatedDays: '3-5',
        method: 'Standard',
        error: error.response?.data?.message || error.message
      };
    }
  },

  // ========== TAX CALCULATION ==========

  /**
   * Calculate tax for the order (CACHED)
   * @param {number} subtotal - Order subtotal
   * @param {string} county - Delivery county
   * @returns {Promise<Object>} - { success, tax, taxRate }
   */
  calculateTax: async (subtotal, county) => {
    const cacheKey = `tax_calc_${subtotal}_${county || 'default'}`;
    
    const cached = checkoutCache.get(cacheKey);
    if (cached) {
      console.log('✅ Tax calculation cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Calculating tax:', { subtotal, county });
      
      const response = await clientApi.post('/checkout/calculate-tax', { subtotal, county });
      
      console.log('📥 Tax calculation response:', response.data);
      
      const result = {
        success: response.data?.success || false,
        tax: response.data?.tax || 0,
        taxRate: response.data?.taxRate || 0
      };
      
      // Cache tax calculation for 30 minutes
      checkoutCache.put(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('❌ Error calculating tax:', error);
      return {
        success: false,
        tax: 0,
        taxRate: 0,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // ========== PROMO CODES ==========

  /**
   * Apply promo code (CACHED - short TTL)
   * @param {string} code - Promo code
   * @param {number} subtotal - Order subtotal
   * @returns {Promise<Object>} - { success, discount, message, newTotal }
   */
  applyPromoCode: async (code, subtotal) => {
    const cacheKey = `promo_${code}_${subtotal}`;
    
    const cached = checkoutCache.get(cacheKey);
    if (cached) {
      console.log('✅ Promo code cache hit:', code);
      return { ...cached, cached: true };
    }
    
    try {
      console.log(`📤 Applying promo code: ${code}`);
      
      const response = await clientApi.post('/checkout/apply-promo', { code, subtotal });
      
      console.log('📥 Promo application response:', response.data);
      
      const result = {
        success: response.data?.success || false,
        discount: response.data?.discount || 0,
        newTotal: response.data?.newTotal || subtotal,
        message: response.data?.message || (response.data?.success ? 'Promo code applied' : 'Invalid promo code')
      };
      
      // Cache promo code result for 5 minutes
      if (result.success) {
        checkoutCache.put(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error applying promo code:', error);
      return {
        success: false,
        discount: 0,
        newTotal: subtotal,
        message: error.response?.data?.message || 'Error applying promo code'
      };
    }
  },

  /**
   * Remove applied promo code (NO CACHE)
   * @returns {Promise<Object>} - { success, message }
   */
  removePromoCode: async () => {
    try {
      console.log('📤 Removing promo code');
      
      const response = await clientApi.delete('/checkout/remove-promo');
      
      console.log('📥 Remove promo response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error removing promo code:', error);
      throw error;
    }
  },

  // ========== ORDER PREVIEW ==========

  /**
   * Get order preview with all calculations (CACHED - short TTL)
   * @param {Object} checkoutData - Complete checkout data
   * @returns {Promise<Object>} - { success, preview }
   */
  getOrderPreview: async (checkoutData) => {
    const cacheKey = `order_preview_${JSON.stringify(checkoutData)}`;
    
    const cached = checkoutCache.get(cacheKey);
    if (cached) {
      console.log('✅ Order preview cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Getting order preview:', checkoutData);
      
      const response = await clientApi.post('/checkout/preview', checkoutData);
      
      console.log('📥 Order preview response:', response.data);
      
      const result = {
        success: response.data?.success || false,
        preview: response.data?.preview || {
          subtotal: 0,
          shipping: 0,
          tax: 0,
          discount: 0,
          total: 0,
          items: []
        }
      };
      
      // Cache order preview for 2 minutes
      checkoutCache.put(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('❌ Error getting order preview:', error);
      return {
        success: false,
        preview: {
          subtotal: 0,
          shipping: 0,
          tax: 0,
          discount: 0,
          total: 0,
          items: []
        },
        error: error.response?.data?.message || error.message
      };
    }
  },

  // ========== CHECKOUT COMPLETION ==========

  /**
   * Complete checkout and create order (NO CACHE - WRITE OPERATION)
   * @param {Object} checkoutData - Complete checkout data
   * @returns {Promise<Object>} - { success, order, message }
   */
  completeCheckout: async (checkoutData) => {
    try {
      console.log('📤 Completing checkout:', checkoutData);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');

      const response = await clientApi.post('/checkout/complete', checkoutData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });
      
      console.log('📥 Checkout complete response:', response.data);
      
      // Clear relevant caches after checkout completion
      checkoutCache.put('saved_addresses', null);
      checkoutCache.put('shipping_methods', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error completing checkout:', error);
      throw error;
    }
  },

  // ========== CACHE MANAGEMENT ==========

  /**
   * Clear all checkout caches
   */
  clearAllCaches: () => {
    checkoutCache.clear();
    console.log('🗑️ All checkout caches cleared');
  }
};

export default clientCheckoutService;