// src/services/notifications.js
import api from './api';

export const notificationsService = {
  // Get notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/admin/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/admin/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.post('/admin/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/admin/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get notification statistics
  getStats: async () => {
    try {
      const response = await api.get('/admin/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  },

  // Create a notification (for testing or manual alerts)
  createNotification: async (data) => {
    try {
      const response = await api.post('/admin/notifications', data);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Subscribe to WebSocket for real-time notifications
  subscribeToNotifications: (onNotification) => {
    // This would connect to a WebSocket or use Server-Sent Events
    // For now, we'll use polling (implemented in the component)
    console.log('WebSocket subscription would be implemented here');
  }
};

export default notificationsService;