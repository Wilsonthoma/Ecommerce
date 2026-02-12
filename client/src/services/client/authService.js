import api from './api.js';

// ✅ FIXED: Removed all double /api prefixes
export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      // ✅ CORRECT: No /api prefix (baseURL already has http://localhost:5000)
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      // ✅ CORRECT: No /api prefix
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // ✅ NEW: Send password reset OTP
  sendResetOtp: async (email) => {
    try {
      const response = await api.post('/auth/send-reset-otp', { email });
      return response.data;
    } catch (error) {
      console.error('Send reset OTP error:', error);
      throw error;
    }
  },

  // ✅ NEW: Verify reset OTP
  verifyResetOtp: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-reset-otp', { email, otp });
      return response.data;
    } catch (error) {
      console.error('Verify reset OTP error:', error);
      throw error;
    }
  },

  // ✅ NEW: Reset password
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // ✅ NEW: Send email verification OTP
  sendVerifyOtp: async () => {
    try {
      const response = await api.post('/auth/send-verify-otp');
      return response.data;
    } catch (error) {
      console.error('Send verify OTP error:', error);
      throw error;
    }
  },

  // ✅ NEW: Verify email
  verifyEmail: async (otp) => {
    try {
      const response = await api.post('/auth/verify-email', { otp });
      return response.data;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  },

  // ✅ NEW: Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // ✅ NEW: Get user token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // ✅ NEW: Get user data
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // ✅ NEW: Google OAuth login
  googleLogin: () => {
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  },

  // ✅ NEW: Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }
};

export default authService;