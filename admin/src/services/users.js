import api from './api';

export const userService = {
  getAll: async (params = {}) => {
    console.log('👤 userService.getAll called with params:', params);
    try {
      // ✅ FIXED: Remove /api prefix - api.js already adds it
      const response = await api.get('/admin/users', { params });
      console.log('📥 userService.getAll response:', response.data);
      
      return {
        success: response.data?.success || false,
        data: response.data?.data || [],
        pagination: response.data?.pagination || {}
      };
    } catch (error) {
      console.error('❌ userService.getAll error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  getById: async (id) => {
    console.log(`👤 userService.getById called for ID: ${id}`);
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.get(`/admin/users/${id}`);
      console.log('📥 userService.getById response:', response.data);
      
      return {
        success: response.data?.success || false,
        data: response.data?.data || response.data
      };
    } catch (error) {
      console.error(`❌ userService.getById error for ID ${id}:`, error);
      throw error;
    }
  },

  create: async (userData) => {
    console.log('👤 userService.create called with data:', userData);
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.post('/admin/users', userData);
      console.log('✅ userService.create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.create error:', error.response?.data || error);
      throw error;
    }
  },

  update: async (id, userData) => {
    console.log(`👤 userService.update called for ID ${id}:`, userData);
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.put(`/admin/users/${id}`, userData);
      console.log('✅ userService.update response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ userService.update error for ID ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    console.log(`👤 userService.delete called for ID: ${id}`);
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.delete(`/admin/users/${id}`);
      console.log('✅ userService.delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ userService.delete error for ID ${id}:`, error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    console.log(`👤 userService.updateStatus called: ID=${id}, status=${status}`);
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.patch(`/admin/users/${id}`, { status });
      console.log('✅ userService.updateStatus response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ userService.updateStatus error:`, error);
      throw error;
    }
  }
};

export default userService;