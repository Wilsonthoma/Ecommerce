// client/src/services/client/orders.js - Cleaned up - ONLY order management
import clientApi from './api';

/**
 * Order Service - Handles ONLY order management after checkout
 * Matches backend endpoints (clientApi automatically adds /api prefix)
 */
export const clientOrderService = {
  // ========== ORDER MANAGEMENT ==========

  /**
   * Get all orders for the current user
   * @param {Object} params - Query parameters (page, limit, status, sort)
   * @returns {Promise<Object>} - { success, orders, total, pages, currentPage }
   */
  getUserOrders: async (params = {}) => {
    try {
      console.log('📤 Fetching user orders with params:', params);
      
      const token = localStorage.getItem('token');

      const response = await clientApi.get('/orders/user', { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 User orders response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          orders: response.data.orders || [],
          total: response.data.total || 0,
          pages: response.data.pages || 1,
          currentPage: response.data.currentPage || 1
        };
      }
      
      return {
        success: false,
        orders: [],
        total: 0,
        pages: 1,
        currentPage: 1
      };
    } catch (error) {
      console.error('❌ Error fetching user orders:', error);
      return {
        success: false,
        orders: [],
        total: 0,
        pages: 1,
        currentPage: 1,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get single order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} - { success, order }
   */
  getOrder: async (id) => {
    try {
      console.log(`📤 Fetching order ${id}`);
      
      const token = localStorage.getItem('token');

      const response = await clientApi.get(`/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Order response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          order: response.data.order || null
        };
      }
      
      return {
        success: false,
        order: null,
        error: 'Order not found'
      };
    } catch (error) {
      console.error(`❌ Error fetching order ${id}:`, error);
      return {
        success: false,
        order: null,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Cancel an order
   * @param {string} id - Order ID
   * @param {string} reason - Cancellation reason (optional)
   * @returns {Promise<Object>} - { success, message }
   */
  cancelOrder: async (id, reason = '') => {
    try {
      console.log(`📤 Cancelling order ${id}`);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');

      const response = await clientApi.put(`/orders/${id}/cancel`, 
        { reason },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrfToken || ''
          }
        }
      );
      
      console.log('📥 Cancel order response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error cancelling order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Track order status and location
   * @param {string} id - Order ID
   * @returns {Promise<Object>} - { success, tracking }
   */
  trackOrder: async (id) => {
    try {
      console.log(`📤 Tracking order ${id}`);
      
      const token = localStorage.getItem('token');

      const response = await clientApi.get(`/orders/${id}/track`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Track order response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          tracking: response.data.tracking || {}
        };
      }
      
      return {
        success: false,
        tracking: {}
      };
    } catch (error) {
      console.error(`❌ Error tracking order ${id}:`, error);
      return {
        success: false,
        tracking: {},
        error: error.response?.data?.message || error.message
      };
    }
  },

  // ========== ORDER HISTORY ==========

  /**
   * Get order history with pagination and filters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} status - Filter by status
   * @returns {Promise<Object>} - { success, orders, total, pages }
   */
  getOrderHistory: async (page = 1, limit = 10, status = '') => {
    try {
      console.log(`📤 Fetching order history: page ${page}, limit ${limit}, status ${status}`);
      
      const token = localStorage.getItem('token');

      const response = await clientApi.get('/orders/history', {
        params: { page, limit, status },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Order history response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          orders: response.data.orders || [],
          total: response.data.total || 0,
          pages: response.data.pages || 1,
          currentPage: response.data.currentPage || page
        };
      }
      
      return {
        success: false,
        orders: [],
        total: 0,
        pages: 1,
        currentPage: page
      };
    } catch (error) {
      console.error('❌ Error fetching order history:', error);
      return {
        success: false,
        orders: [],
        total: 0,
        pages: 1,
        currentPage: page,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // ========== ORDER ACTIONS ==========

  /**
   * Request return for an order
   * @param {string} orderId - Order ID
   * @param {Array} items - Items to return
   * @param {string} reason - Return reason
   * @returns {Promise<Object>} - { success, message, returnId }
   */
  requestReturn: async (orderId, items, reason) => {
    try {
      console.log(`📤 Requesting return for order ${orderId}:`, { items, reason });
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');

      const response = await clientApi.post('/orders/return', 
        { orderId, items, reason },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrfToken || ''
          }
        }
      );
      
      console.log('📥 Return request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error requesting return:', error);
      throw error;
    }
  },

  /**
   * Get return status for an order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - { success, status, details }
   */
  getReturnStatus: async (orderId) => {
    try {
      console.log(`📤 Getting return status for order ${orderId}`);
      
      const token = localStorage.getItem('token');

      const response = await clientApi.get(`/orders/${orderId}/return`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Return status response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          status: response.data.status || 'pending',
          details: response.data.details || {}
        };
      }
      
      return {
        success: false,
        status: 'unknown',
        details: {}
      };
    } catch (error) {
      console.error('❌ Error getting return status:', error);
      return {
        success: false,
        status: 'unknown',
        details: {},
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Add note to an order
   * @param {string} orderId - Order ID
   * @param {string} note - Note text
   * @returns {Promise<Object>} - { success, message }
   */
  addOrderNote: async (orderId, note) => {
    try {
      console.log(`📤 Adding note to order ${orderId}:`, note);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');

      const response = await clientApi.post(`/orders/${orderId}/notes`, 
        { note },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrfToken || ''
          }
        }
      );
      
      console.log('📥 Add note response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding order note:', error);
      throw error;
    }
  },

  /**
   * Download invoice for an order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - { success, blob }
   */
  downloadInvoice: async (orderId) => {
    try {
      console.log(`📤 Downloading invoice for order ${orderId}`);
      
      const token = localStorage.getItem('token');

      const response = await clientApi.get(`/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error downloading invoice:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Reorder previous order (add all items to cart)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - { success, message, items }
   */
  reorder: async (orderId) => {
    try {
      console.log(`📤 Reordering order ${orderId}`);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');

      const response = await clientApi.post(`/orders/${orderId}/reorder`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        }
      });
      
      console.log('📥 Reorder response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error reordering:', error);
      throw error;
    }
  },

  /**
   * Rate an order (leave review)
   * @param {string} orderId - Order ID
   * @param {number} rating - Rating (1-5)
   * @param {string} review - Review text
   * @returns {Promise<Object>} - { success, message }
   */
  rateOrder: async (orderId, rating, review) => {
    try {
      console.log(`📤 Rating order ${orderId}:`, { rating, review });
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');

      const response = await clientApi.post(`/orders/${orderId}/rate`, 
        { rating, review },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrfToken || ''
          }
        }
      );
      
      console.log('📥 Rate order response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error rating order:', error);
      throw error;
    }
  }
};

export default clientOrderService;