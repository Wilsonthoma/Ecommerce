import clientApi from './api';

export const clientOrderService = {
  // Create order
  createOrder: async (orderData) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async (params = {}) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get('/orders/user', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Get order details
  getOrder: async (id) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (id) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.put(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
  },

  // Track order
  trackOrder: async (id) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get(`/orders/${id}/track`);
      return response.data;
    } catch (error) {
      console.error(`Error tracking order ${id}:`, error);
      throw error;
    }
  },

  // Validate promo code
  validatePromoCode: async (code, cartTotal) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.post('/promo/validate', { code, cartTotal });
      return response.data;
    } catch (error) {
      console.error('Error validating promo code:', error);
      throw error;
    }
  },

  // Get shipping methods
  getShippingMethods: async () => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get('/shipping/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      throw error;
    }
  },

  // Calculate shipping
  calculateShipping: async (address, items) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.post('/shipping/calculate', { address, items });
      return response.data;
    } catch (error) {
      console.error('Error calculating shipping:', error);
      throw error;
    }
  },

  // Get estimated delivery date
  getEstimatedDelivery: async (shippingMethod, postalCode) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get('/shipping/estimate', {
        params: { shippingMethod, postalCode }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting estimated delivery:', error);
      throw error;
    }
  },

  // Create payment intent
  createPaymentIntent: async (orderId, paymentMethod) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.post('/payment/intent', { orderId, paymentMethod });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Confirm payment
  confirmPayment: async (orderId, paymentDetails) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.post('/payment/confirm', { orderId, ...paymentDetails });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  // Get order history
  getOrderHistory: async (page = 1, limit = 10, status = '') => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get('/orders/history', {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  },

  // Request return
  requestReturn: async (orderId, items, reason) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.post('/orders/return', { orderId, items, reason });
      return response.data;
    } catch (error) {
      console.error('Error requesting return:', error);
      throw error;
    }
  },

  // Get return status
  getReturnStatus: async (orderId) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get(`/orders/${orderId}/return`);
      return response.data;
    } catch (error) {
      console.error('Error getting return status:', error);
      throw error;
    }
  },

  // Add order note
  addOrderNote: async (orderId, note) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.post(`/orders/${orderId}/notes`, { note });
      return response.data;
    } catch (error) {
      console.error('Error adding order note:', error);
      throw error;
    }
  },

  // Download invoice
  downloadInvoice: async (orderId) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  },

  // Reorder
  reorder: async (orderId) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.post(`/orders/${orderId}/reorder`);
      return response.data;
    } catch (error) {
      console.error('Error reordering:', error);
      throw error;
    }
  },

  // Rate order
  rateOrder: async (orderId, rating, review) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.post(`/orders/${orderId}/rate`, { rating, review });
      return response.data;
    } catch (error) {
      console.error('Error rating order:', error);
      throw error;
    }
  }
};