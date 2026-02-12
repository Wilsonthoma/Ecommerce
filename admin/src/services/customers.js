// src/services/customers.js
import api from './api';

export const customerService = {
  // Get all customers (admin endpoint)
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/customers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get customer details (admin endpoint)
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  },

  // Update customer (admin endpoint)
  update: async (id, customerData) => {
    try {
      const response = await api.put(`/admin/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  },

  // Delete customer (admin endpoint)
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  },

  // Get customer statistics
  getStats: async () => {
    try {
      const response = await api.get('/admin/customers/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  },

  // Update customer status
  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/admin/customers/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating customer ${id} status:`, error);
      throw error;
    }
  },

  // Add customer note
  addNote: async (id, note) => {
    try {
      const response = await api.post(`/admin/customers/${id}/notes`, { note });
      return response.data;
    } catch (error) {
      console.error(`Error adding note to customer ${id}:`, error);
      throw error;
    }
  },

  // Search customers
  search: async (query, params = {}) => {
    try {
      const response = await api.get('/admin/customers/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  },

  // Export customers
  export: async (params = {}) => {
    try {
      const response = await api.get('/admin/customers/export', {
        params,
        responseType: 'blob' // For file download
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting customers:', error);
      throw error;
    }
  }
};
export default customerService;