// src/services/client/address.js - Complete Address Service with LRU Cache
import clientApi from './api';
import { cachedApi } from './apiWithCache';
import { LRUCache } from '../../dataStructures/LRUCache';

// Create dedicated cache for addresses
const addressCache = new LRUCache(20); // Cache up to 20 addresses

/**
 * Address Service - Handles all address-related API calls
 * Endpoints: /api/addresses/*
 */
class AddressService {
  constructor() {
    this.pendingRequests = new Map(); // For deduplicating in-flight requests
  }

  /**
   * Deduplicate in-flight requests
   */
  async dedupeRequest(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      console.log('🔄 Reusing in-flight address request:', key);
      return this.pendingRequests.get(key);
    }
    
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Get all addresses for the current user (CACHED)
   */
  async getAddresses() {
    const cacheKey = 'user_addresses';
    
    // Check cache first
    const cached = addressCache.get(cacheKey);
    if (cached) {
      console.log('✅ Addresses cache hit');
      return { ...cached, cached: true };
    }
    
    return await this.dedupeRequest(cacheKey, async () => {
      try {
        console.log('📤 Fetching user addresses...');
        
        const response = await clientApi.get('/addresses');
        
        console.log('📥 Addresses response:', response.data);
        
        if (response.data?.success) {
          const result = {
            success: true,
            addresses: response.data.addresses || [],
            count: response.data.count || 0
          };
          
          // Cache the result
          addressCache.put(cacheKey, result);
          
          return { ...result, cached: false };
        }
        
        return {
          success: false,
          addresses: [],
          count: 0,
          cached: false
        };
      } catch (error) {
        console.error('❌ Error fetching addresses:', error);
        return {
          success: false,
          addresses: [],
          count: 0,
          error: error.response?.data?.message || error.message,
          cached: false
        };
      }
    });
  }

  /**
   * Get a single address by ID (CACHED)
   */
  async getAddress(addressId) {
    const cacheKey = `address_${addressId}`;
    
    // Check cache first
    const cached = addressCache.get(cacheKey);
    if (cached) {
      console.log('✅ Address cache hit:', addressId);
      return { ...cached, cached: true };
    }
    
    return await this.dedupeRequest(`address_${addressId}`, async () => {
      try {
        console.log(`📤 Fetching address ${addressId}...`);
        
        const response = await clientApi.get(`/addresses/${addressId}`);
        
        console.log('📥 Address response:', response.data);
        
        if (response.data?.success) {
          const result = {
            success: true,
            address: response.data.address || null
          };
          
          // Cache the result
          addressCache.put(cacheKey, result);
          
          return { ...result, cached: false };
        }
        
        return {
          success: false,
          address: null,
          cached: false
        };
      } catch (error) {
        console.error(`❌ Error fetching address ${addressId}:`, error);
        return {
          success: false,
          address: null,
          error: error.response?.data?.message || error.message,
          cached: false
        };
      }
    });
  }

  /**
   * Create a new address (NO CACHE - WRITE OPERATION)
   */
  async createAddress(addressData) {
    try {
      console.log('📤 Creating new address:', addressData);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to add an address');
      }

      const response = await clientApi.post('/addresses', addressData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Create address response:', response.data);
      
      // Clear addresses cache after creation
      this.clearAddressesCache();
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating address:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to add an address');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid address data');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to create address');
      }
    }
  }

  /**
   * Update an address (NO CACHE - WRITE OPERATION)
   */
  async updateAddress(addressId, addressData) {
    try {
      console.log(`📤 Updating address ${addressId}:`, addressData);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to update an address');
      }

      const response = await clientApi.put(`/addresses/${addressId}`, addressData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Update address response:', response.data);
      
      // Clear caches after update
      this.clearAddressesCache();
      this.clearAddressCache(addressId);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating address ${addressId}:`, error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to update an address');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to update this address');
      } else if (error.response?.status === 404) {
        throw new Error('Address not found');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to update address');
      }
    }
  }

  /**
   * Delete an address (NO CACHE - WRITE OPERATION)
   */
  async deleteAddress(addressId) {
    try {
      console.log(`📤 Deleting address ${addressId}...`);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to delete an address');
      }

      const response = await clientApi.delete(`/addresses/${addressId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Delete address response:', response.data);
      
      // Clear caches after deletion
      this.clearAddressesCache();
      this.clearAddressCache(addressId);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting address ${addressId}:`, error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to delete an address');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this address');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to delete address');
      }
    }
  }

  /**
   * Set an address as default (NO CACHE - WRITE OPERATION)
   */
  async setDefaultAddress(addressId) {
    try {
      console.log(`📤 Setting address ${addressId} as default...`);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to set default address');
      }

      const response = await clientApi.patch(`/addresses/${addressId}/default`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Set default address response:', response.data);
      
      // Clear caches after update
      this.clearAddressesCache();
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error setting default address ${addressId}:`, error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to set default address');
      } else if (error.response?.status === 404) {
        throw new Error('Address not found');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to set default address');
      }
    }
  }

  /**
   * Get default address (CACHED)
   */
  async getDefaultAddress() {
    const cacheKey = 'default_address';
    
    // Check cache first
    const cached = addressCache.get(cacheKey);
    if (cached) {
      console.log('✅ Default address cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Fetching default address...');
      
      const response = await clientApi.get('/addresses/default');
      
      console.log('📥 Default address response:', response.data);
      
      if (response.data?.success) {
        const result = {
          success: true,
          address: response.data.address || null
        };
        
        // Cache the result
        addressCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: true,
        address: null,
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching default address:', error);
      return {
        success: false,
        address: null,
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Clear addresses list cache
   */
  clearAddressesCache() {
    addressCache.put('user_addresses', null);
    addressCache.put('default_address', null);
    console.log('🗑️ Addresses cache cleared');
  }

  /**
   * Clear a specific address cache
   */
  clearAddressCache(addressId) {
    addressCache.put(`address_${addressId}`, null);
    console.log(`🗑️ Address cache cleared for ${addressId}`);
  }

  /**
   * Clear all address caches
   */
  clearAllCaches() {
    addressCache.clear();
    console.log('🗑️ All address caches cleared');
  }

  /**
   * Validate address fields (helper method)
   */
  validateAddress(address) {
    const errors = {};
    
    if (!address.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!address.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^0\d{9}$/.test(address.phone.replace(/\s/g, ''))) {
      errors.phone = 'Enter a valid Kenyan phone number';
    }
    
    if (!address.addressLine?.trim()) {
      errors.addressLine = 'Address line is required';
    }
    
    if (!address.city?.trim()) {
      errors.city = 'City is required';
    }
    
    if (!address.country?.trim()) {
      errors.country = 'Country is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Create and export a singleton instance
export const clientAddressService = new AddressService();

export default clientAddressService;