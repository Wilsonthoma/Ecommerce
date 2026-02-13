import api from './api';

export const orderService = {
  // ✅ ALREADY CORRECT - No /api prefix
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // ✅ ALREADY CORRECT
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  // ✅ ALREADY CORRECT
  create: async (orderData) => {
    try {
      const response = await api.post('/admin/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // ✅ ALREADY CORRECT
  update: async (id, orderData) => {
    try {
      const response = await api.put(`/admin/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },

  // ✅ ALREADY CORRECT
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  },

  // ✅ ALREADY CORRECT
  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      throw error;
    }
  },

  // ✅ ALREADY CORRECT
  getStatistics: async () => {
    try {
      const response = await api.get('/admin/orders/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  },

  // ✅ ALREADY CORRECT
  getTimeline: async (id) => {
    try {
      const response = await api.get(`/admin/orders/${id}/timeline`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching timeline for order ${id}:`, error);
      throw error;
    }
  },

  // ✅ ALREADY CORRECT
  fulfill: async (id, trackingData = {}) => {
    try {
      const response = await api.put(`/admin/orders/${id}/fulfill`, trackingData);
      return response.data;
    } catch (error) {
      console.error(`Error fulfilling order ${id}:`, error);
      throw error;
    }
  },

  // ✅ ALREADY CORRECT
  bulkUpdateStatus: async (orderIds, status) => {
    try {
      const response = await api.put('/admin/orders/bulk/status', {
        orderIds,
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating order statuses:', error);
      throw error;
    }
  }
};

export default orderService;