import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import config from '../config/env.js';

/**
 * Generate JWT Token with enhanced options
 * @param {Object|String} payload - Token payload
 * @param {String} expiresIn - Token expiration (default: 7d)
 * @returns {String} - JWT token
 */
export const generateToken = (payload, expiresIn = '7d') => {
  if (typeof payload === 'string') {
    payload = { id: payload };
  }
  
  return jwt.sign(
    payload, 
    config.jwt.secret, 
    { 
      expiresIn,
      issuer: config.server.apiPrefix,
      audience: config.server.frontendUrl
    }
  );
};

/**
 * Verify and decode JWT token
 * @param {String} token - JWT token
 * @returns {Object|null} - Decoded payload or null
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Generate secure random string
 * @param {Number} length - Desired length
 * @param {String} type - 'hex', 'base64', 'alphanumeric'
 * @returns {String} - Random string
 */
export const generateRandomString = (length = 32, type = 'hex') => {
  const bytes = crypto.randomBytes(Math.ceil(length / 2));
  
  switch (type) {
    case 'hex':
      return bytes.toString('hex').slice(0, length);
    case 'base64':
      return bytes.toString('base64').slice(0, length).replace(/[+/]/g, '');
    case 'alphanumeric':
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(crypto.randomInt(0, chars.length));
      }
      return result;
    default:
      return bytes.toString('hex').slice(0, length);
  }
};

/**
 * Generate OTP (One-Time Password)
 * @param {Number} length - OTP length (4-8)
 * @returns {String} - OTP code
 */
export const generateOTP = (length = 6) => {
  if (length < 4 || length > 8) length = 6;
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(crypto.randomInt(min, max));
};

/**
 * Hash password using bcrypt
 * @param {String} password - Plain text password
 * @returns {Promise<String>} - Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 * @param {String} password - Plain text password
 * @param {String} hash - Hashed password
 * @returns {Promise<Boolean>} - Match result
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate order number with format ORD-YYYYMMDD-XXXXX
 * @returns {String} - Order number
 */
export const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${dateStr}-${random}`;
};

/**
 * Generate unique SKU
 * @param {String} productName - Product name
 * @param {String} category - Product category
 * @returns {String} - SKU code
 */
export const generateSKU = (productName, category = '') => {
  const prefix = category ? category.slice(0, 3).toUpperCase() : 'PRO';
  const nameCode = productName
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 3)
    .toUpperCase();
  const random = generateRandomString(6, 'alphanumeric').toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  
  return `${prefix}-${nameCode}-${random}-${timestamp}`;
};

/**
 * Format currency with localization
 * @param {Number} amount - Amount to format
 * @param {String} currency - Currency code (USD, EUR, etc.)
 * @param {String} locale - Locale code
 * @returns {String} - Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    amount = 0;
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date with various formats
 * @param {Date|String} date - Date to format
 * @param {String} format - Format type
 * @returns {String} - Formatted date
 */
export const formatDate = (date, format = 'standard') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const formats = {
    standard: d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    full: d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    iso: d.toISOString().split('T')[0],
    time: d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    datetime: d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    relative: (() => {
      const now = new Date();
      const diffMs = now - d;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffDay > 7) return formatDate(d, 'standard');
      if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
      if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
      return 'Just now';
    })()
  };
  
  return formats[format] || formats.standard;
};

/**
 * Calculate percentage change
 * @param {Number} current - Current value
 * @param {Number} previous - Previous value
 * @returns {Object} - Change data
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return {
      change: current > 0 ? 100 : 0,
      direction: current > 0 ? 'up' : 'neutral',
      isPositive: current > 0
    };
  }
  
  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;
  const direction = isPositive ? 'up' : 'down';
  
  return {
    change: Math.abs(Math.round(change * 100) / 100),
    direction,
    isPositive,
    raw: change
  };
};

/**
 * Calculate days between dates
 * @param {Date|String} date1 - First date
 * @param {Date|String} date2 - Second date
 * @returns {Number} - Days difference
 */
export const daysBetween = (date1, date2 = new Date()) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Validate email address
 * @param {String} email - Email to validate
 * @returns {Boolean} - Validation result
 */
export const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate phone number (international format)
 * @param {String} phone - Phone number to validate
 * @returns {Boolean} - Validation result
 */
export const isValidPhone = (phone) => {
  // Basic international phone validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Sanitize input for database
 * @param {String} input - Input string
 * @returns {String} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[&<>"']/g, '') // Remove special chars
    .trim()
    .slice(0, 1000); // Limit length
};

/**
 * Truncate text with ellipsis
 * @param {String} text - Text to truncate
 * @param {Number} length - Maximum length
 * @returns {String} - Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
};

/**
 * Generate pagination metadata
 * @param {Number} total - Total items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
export const generatePagination = (total, page = 1, limit = 10) => {
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.max(1, Math.min(100, parseInt(limit) || 10));
  
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
    offset: (page - 1) * limit,
    startItem: total > 0 ? (page - 1) * limit + 1 : 0,
    endItem: Math.min(page * limit, total)
  };
};

/**
 * Generate random hex color
 * @returns {String} - Hex color code
 */
export const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Convert string to URL slug
 * @param {String} text - Text to convert
 * @returns {String} - URL slug
 */
export const toSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens
    .trim()
    .slice(0, 100);
};

/**
 * Generate unique tracking ID
 * @returns {String} - Tracking ID
 */
export const generateTrackingId = () => {
  const timestamp = Date.now().toString(36);
  const random = generateRandomString(8, 'alphanumeric').toUpperCase();
  return `TRK-${timestamp}-${random}`;
};

/**
 * Create cache key
 * @param {String} prefix - Cache prefix
 * @param {...any} parts - Key parts
 * @returns {String} - Cache key
 */
export const createCacheKey = (prefix, ...parts) => {
  const keyParts = parts.map(part => {
    if (typeof part === 'object') {
      return JSON.stringify(part);
    }
    return String(part);
  });
  
  return `${prefix}:${keyParts.join(':')}`;
};

/**
 * Generate API key
 * @returns {String} - API key
 */
export const generateAPIKey = () => {
  const prefix = 'sk_';
  const key = crypto.randomBytes(32).toString('base64').replace(/[+/=]/g, '');
  return prefix + key;
};

/**
 * Mask sensitive data
 * @param {String} data - Sensitive data
 * @param {Number} visibleChars - Number of visible chars at end
 * @returns {String} - Masked data
 */
export const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data || data.length <= visibleChars) return '*'.repeat(data?.length || 0);
  
  const maskedLength = data.length - visibleChars;
  return '*'.repeat(maskedLength) + data.slice(-visibleChars);
};

/**
 * Parse query string to object
 * @param {String} queryString - Query string
 * @returns {Object} - Parsed query object
 */
export const parseQueryString = (queryString) => {
  if (!queryString) return {};
  
  return queryString
    .replace(/^\?/, '')
    .split('&')
    .reduce((acc, pair) => {
      const [key, value] = pair.split('=');
      if (key) {
        acc[decodeURIComponent(key)] = value ? decodeURIComponent(value) : true;
      }
      return acc;
    }, {});
};

/**
 * Delay execution (for testing/rate limiting)
 * @param {Number} ms - Milliseconds to delay
 * @returns {Promise} - Resolves after delay
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Calculate reading time
 * @param {String} text - Text content
 * @param {Number} wpm - Words per minute (default: 200)
 * @returns {Number} - Minutes to read
 */
export const calculateReadingTime = (text, wpm = 200) => {
  if (!text) return 0;
  
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wpm);
};

export default {
  generateToken,
  verifyToken,
  generateRandomString,
  generateOTP,
  hashPassword,
  comparePassword,
  generateOrderNumber,
  generateSKU,
  formatCurrency,
  formatDate,
  calculatePercentageChange,
  daysBetween,
  isValidEmail,
  isValidPhone,
  sanitizeInput,
  truncateText,
  generatePagination,
  generateRandomColor,
  toSlug,
  generateTrackingId,
  createCacheKey,
  generateAPIKey,
  maskSensitiveData,
  parseQueryString,
  delay,
  calculateReadingTime
};