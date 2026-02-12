// utils/formatters.js
import { format, parseISO, isValid } from 'date-fns';

/**
 * Format currency with Kenyan Shilling (KES) as default
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'KES')
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'KES', options = {}) => {
  const defaultOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options
  };
  
  try {
    // Special handling for Kenyan Shillings (KES)
    if (currency === 'KES') {
      const formatter = new Intl.NumberFormat('en-KE', defaultOptions);
      const formatted = formatter.format(amount);
      // Use 'KSh' instead of 'KES' for better UX in Kenya
      return formatted.replace('KES', 'KSh');
    }
    
    // For other currencies
    const formatter = new Intl.NumberFormat('en-US', defaultOptions);
    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currency} ${amount.toLocaleString('en-KE')}`;
  }
};

/**
 * Format amount in Kenyan Shillings with proper symbol
 * @param {number} amount - Amount in KES
 * @param {boolean} showSymbol - Whether to show KES symbol
 * @param {boolean} useKSh - Use 'KSh' instead of 'KES'
 * @returns {string} Formatted KES amount
 */
export const formatKSH = (amount, showSymbol = true, useKSh = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return useKSh ? 'KSh 0' : 'KES 0';
  }
  
  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  const symbol = useKSh ? 'KSh' : 'KES';
  return showSymbol ? `${symbol} ${formatted}` : formatted;
};

/**
 * Format amount with decimal places for KES
 * @param {number} amount - Amount in KES
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted KES amount with decimals
 */
export const formatKSHWithDecimals = (amount, decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'KSh 0.00';
  
  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
  
  return `KSh ${formatted}`;
};

/**
 * Format large amounts with abbreviations (e.g., 1.5M, 2.3K)
 * @param {number} amount - Amount in KES
 * @param {boolean} withSymbol - Include currency symbol
 * @returns {string} Abbreviated currency amount
 */
export const formatKSHAbbreviated = (amount, withSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return withSymbol ? 'KSh 0' : '0';
  }
  
  const absAmount = Math.abs(amount);
  const symbol = withSymbol ? 'KSh ' : '';
  
  if (absAmount >= 1000000000) {
    return `${symbol}${(amount / 1000000000).toFixed(2)}B`;
  }
  if (absAmount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(2)}M`;
  }
  if (absAmount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(2)}K`;
  }
  
  // Format regular amounts
  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  return withSymbol ? `KSh ${formatted}` : formatted;
};

/**
 * Convert amount from cents/shillings to formatted currency
 * @param {number} amountInCents - Amount in cents (100 cents = 1 KSh)
 * @returns {string} Formatted currency
 */
export const formatFromCents = (amountInCents) => {
  if (amountInCents === null || amountInCents === undefined || isNaN(amountInCents)) {
    return 'KSh 0';
  }
  
  const amountInKSh = amountInCents / 100;
  return formatKSH(amountInKSh);
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string (e.g., 'KSh 1,500')
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbols and commas
  const cleaned = currencyString
    .replace(/[^\d.-]/g, '')
    .replace(/,/g, '');
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Calculate and format VAT (16% in Kenya)
 * @param {number} amount - Amount before VAT
 * @returns {Object} VAT details
 */
export const calculateVAT = (amount) => {
  if (!amount || isNaN(amount)) {
    return {
      vat: 0,
      total: 0,
      formatted: {
        vat: 'KSh 0',
        total: 'KSh 0',
        breakdown: 'KSh 0 + KSh 0 VAT'
      }
    };
  }
  
  const vatRate = 0.16; // 16% VAT in Kenya
  const vat = amount * vatRate;
  const total = amount + vat;
  
  return {
    vat,
    total,
    formatted: {
      vat: formatKSH(vat),
      total: formatKSH(total),
      breakdown: `${formatKSH(amount)} + ${formatKSH(vat)} VAT`
    }
  };
};

/**
 * Format price with discount
 * @param {number} originalPrice - Original price
 * @param {number} discountPercentage - Discount percentage (0-100)
 * @returns {Object} Price details
 */
export const formatDiscountedPrice = (originalPrice, discountPercentage) => {
  if (!originalPrice || isNaN(originalPrice) || discountPercentage < 0) {
    return {
      original: formatKSH(0),
      discounted: formatKSH(0),
      savings: formatKSH(0),
      discountPercentage: 0
    };
  }
  
  const discountAmount = originalPrice * (discountPercentage / 100);
  const discountedPrice = originalPrice - discountAmount;
  
  return {
    original: formatKSH(originalPrice),
    discounted: formatKSH(discountedPrice),
    savings: formatKSH(discountAmount),
    discountPercentage: discountPercentage,
    formatted: {
      original: formatKSH(originalPrice),
      discounted: formatKSH(discountedPrice),
      savings: formatKSH(discountAmount)
    }
  };
};

/**
 * Generate currency range string
 * @param {number} min - Minimum amount
 * @param {number} max - Maximum amount
 * @returns {string} Formatted range
 */
export const formatCurrencyRange = (min, max) => {
  if (!min && !max) return 'N/A';
  
  if (min === max) {
    return formatKSH(min);
  }
  
  if (!max) {
    return `From ${formatKSH(min)}`;
  }
  
  if (!min) {
    return `Up to ${formatKSH(max)}`;
  }
  
  return `${formatKSH(min)} - ${formatKSH(max)}`;
};

/**
 * Helper function for amountToWords
 * @param {number} num - Number to convert to words
 * @returns {string} Number in words
 */
const numberToWords = (num) => {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];
  
  if (num === 0) return 'Zero';
  
  let words = '';
  
  if (num >= 1000) {
    words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  
  if (num > 0) {
    if (words !== '') words += 'and ';
    
    if (num < 20) {
      words += ones[num];
    } else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        words += ' ' + ones[num % 10];
      }
    }
  }
  
  return words.trim();
};

/**
 * Convert to words (simplified for Kenyan context)
 * @param {number} amount - Amount to convert
 * @returns {string} Amount in words
 */
export const amountToWords = (amount) => {
  if (!amount || isNaN(amount) || amount === 0) {
    return 'Zero Kenyan Shillings';
  }
  
  const wholePart = Math.floor(amount);
  const fractionPart = Math.round((amount - wholePart) * 100);
  
  const wholeWords = numberToWords(wholePart);
  const fractionWords = fractionPart > 0 ? numberToWords(fractionPart) : '';
  
  let result = `${wholeWords} Kenyan Shilling${wholePart !== 1 ? 's' : ''}`;
  
  if (fractionPart > 0) {
    result += ` and ${fractionWords} Cent${fractionPart !== 1 ? 's' : ''}`;
  }
  
  return result;
};

/**
 * Format date with various options
 * @param {string|Date} dateInput - Date string or Date object
 * @param {string} formatString - Date format (default: 'MMM dd, yyyy')
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, formatString = 'MMM dd, yyyy', locale = 'en-US') => {
  if (!dateInput) return 'N/A';
  
  try {
    let date;
    
    if (typeof dateInput === 'string') {
      // Try to parse ISO string
      date = parseISO(dateInput);
      if (!isValid(date)) {
        // Try parsing as timestamp
        date = new Date(dateInput);
      }
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return 'Invalid date';
    }
    
    if (!isValid(date)) {
      return 'Invalid date';
    }
    
    // Return relative time for recent dates
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      return `${Math.floor(diffInHours)}h ago`;
    }
    
    if (diffInHours < 48) return 'Yesterday';
    
    // Format full date
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return String(dateInput);
  }
};

/**
 * Format date and time
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateInput) => {
  return formatDate(dateInput, 'MMM dd, yyyy HH:mm');
};

/**
 * Format date for Kenyan locale
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date in Kenyan format
 */
export const formatDateKE = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    
    if (!isValid(date)) {
      return 'Invalid date';
    }
    
    // Kenyan date format: dd/MM/yyyy
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    return formatDate(dateInput);
  }
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {boolean} showEllipsis - Whether to show ellipsis
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100, showEllipsis = true) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength).trim();
  return showEllipsis ? truncated + '...' : truncated;
};

/**
 * Format phone number for Kenyan format
 * @param {string} phone - Phone number string
 * @param {string} countryCode - Country code (default: '254' for Kenya)
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, countryCode = '254') => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle Kenyan phone numbers
  if (countryCode === '254') {
    // Remove leading 0 if present and add country code
    let formatted = cleaned;
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    } else if (!formatted.startsWith('254')) {
      formatted = '254' + formatted;
    }
    
    // Format as +254 XXX XXX XXX
    const match = formatted.match(/^(\d{3})(\d{3})(\d{3})(\d{1,3})?$/);
    if (match) {
      const base = `+${match[1]} ${match[2]} ${match[3]}`;
      return match[4] ? `${base} ${match[4]}` : base;
    }
  }
  
  // Fallback formatting for other countries
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  
  return cleaned;
};

/**
 * Generate order number from ID
 * @param {string} id - Order ID
 * @param {string} prefix - Order prefix (default: 'ORD')
 * @returns {string} Formatted order number
 */
export const formatOrderNumber = (id, prefix = 'ORD') => {
  if (!id) return 'N/A';
  
  // If id is already formatted, return as is
  if (id.startsWith(prefix)) return id;
  
  // Extract last 8 characters and format
  const suffix = id.toString().slice(-8).toUpperCase();
  return `${prefix}-${suffix}`;
};

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @param {number} maxChars - Maximum characters for initials
 * @returns {string} Initials
 */
export const getInitials = (name, maxChars = 2) => {
  if (!name) return '?';
  
  // Split by spaces and get first letters
  const initials = name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0])
    .join('')
    .toUpperCase();
  
  return initials.slice(0, maxChars);
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage
 */
export const calculateDiscount = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice || originalPrice <= 0) return 0;
  
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format number with Kenyan grouping
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Format percentage
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  
  const formatted = value.toFixed(decimals);
  return `${formatted}%`;
};

/**
 * Format social media numbers (e.g., 1.5K, 2.3M)
 * @param {number} num - Number to format
 * @returns {string} Formatted social number
 */
export const formatSocialNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  const absNum = Math.abs(num);
  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format time duration
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

/**
 * Format price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {string} Formatted price range
 */
export const formatPriceRange = (minPrice, maxPrice) => {
  if ((!minPrice || isNaN(minPrice)) && (!maxPrice || isNaN(maxPrice))) return 'N/A';
  
  if (!maxPrice || isNaN(maxPrice)) {
    return `From ${formatKSH(minPrice)}`;
  }
  
  if (!minPrice || isNaN(minPrice)) {
    return `Up to ${formatKSH(maxPrice)}`;
  }
  
  return `${formatKSH(minPrice)} - ${formatKSH(maxPrice)}`;
};

/**
 * Mask sensitive information (e.g., email, phone)
 * @param {string} text - Text to mask
 * @param {string} type - Type of data ('email', 'phone', 'card')
 * @returns {string} Masked text
 */
export const maskSensitiveInfo = (text, type = 'email') => {
  if (!text) return '';
  
  switch (type) {
    case 'email':
      const [local, domain] = text.split('@');
      if (!domain) return text;
      const maskedLocal = local.length > 2 
        ? local[0] + '*'.repeat(Math.min(local.length - 2, 3)) + local[local.length - 1]
        : '*'.repeat(local.length);
      return `${maskedLocal}@${domain}`;
      
    case 'phone':
      return text.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
      
    case 'card':
      return text.replace(/(\d{4})\d{8}(\d{4})/, '$1********$2');
      
    default:
      return text;
  }
};

/**
 * Format status with color code
 * @param {string} status - Status string
 * @returns {Object} Formatted status with color
 */
export const formatStatus = (status) => {
  const statusLower = (status || '').toLowerCase();
  
  const statusMap = {
    // Order statuses
    'pending': { color: '#f59e0b', text: 'Pending', icon: '⏳' },
    'processing': { color: '#3b82f6', text: 'Processing', icon: '⚙️' },
    'shipped': { color: '#8b5cf6', text: 'Shipped', icon: '🚚' },
    'delivered': { color: '#10b981', text: 'Delivered', icon: '✓' },
    'cancelled': { color: '#ef4444', text: 'Cancelled', icon: '✗' },
    'refunded': { color: '#6366f1', text: 'Refunded', icon: '↩️' },
    
    // Payment statuses
    'paid': { color: '#10b981', text: 'Paid', icon: '✓' },
    'unpaid': { color: '#ef4444', text: 'Unpaid', icon: '✗' },
    'pending_payment': { color: '#f59e0b', text: 'Pending Payment', icon: '⏳' },
    'failed': { color: '#ef4444', text: 'Failed', icon: '⚠️' },
    
    // Product statuses
    'active': { color: '#10b981', text: 'Active', icon: '✓' },
    'inactive': { color: '#6b7280', text: 'Inactive', icon: '○' },
    'out_of_stock': { color: '#ef4444', text: 'Out of Stock', icon: '✗' },
    'low_stock': { color: '#f59e0b', text: 'Low Stock', icon: '⚠️' },
    
    // Customer statuses
    'verified': { color: '#10b981', text: 'Verified', icon: '✓' },
    'unverified': { color: '#6b7280', text: 'Unverified', icon: '○' },
    'suspended': { color: '#ef4444', text: 'Suspended', icon: '⛔' },
  };
  
  return statusMap[statusLower] || { color: '#6b7280', text: status || 'Unknown', icon: '?' };
};

/**
 * Format inventory status
 * @param {number} quantity - Current quantity
 * @param {number} threshold - Low stock threshold
 * @returns {Object} Inventory status
 */
export const formatInventoryStatus = (quantity, threshold = 10) => {
  if (quantity === 0) {
    return { status: 'out_of_stock', color: '#ef4444', text: 'Out of Stock', icon: '✗' };
  }
  
  if (quantity <= threshold) {
    return { status: 'low_stock', color: '#f59e0b', text: `Low Stock (${quantity})`, icon: '⚠️' };
  }
  
  return { status: 'in_stock', color: '#10b981', text: `In Stock (${quantity})`, icon: '✓' };
};

/**
 * Format rating stars
 * @param {number} rating - Rating (0-5)
 * @returns {string} Star representation
 */
export const formatRating = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
};

/**
 * Format address for display
 * @param {Object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return 'N/A';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.country,
    address.postalCode
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Format timestamp to relative time
 * @param {string|Date} timestamp - Timestamp
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  if (!isValid(date)) return 'Invalid date';
  
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

/**
 * Generate a random color based on string
 * @param {string} str - Input string
 * @returns {string} Hex color code
 */
export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Format bytes to human readable size with units
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted size
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format a number as Kenyan phone money format (e.g., 1,234.50)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
export const formatMobileMoney = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0.00';
  
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Export all formatters
export default {
  // Currency formatters
  formatCurrency,
  formatKSH,
  formatKSHWithDecimals,
  formatKSHAbbreviated,
  formatFromCents,
  parseCurrency,
  calculateVAT,
  formatDiscountedPrice,
  formatCurrencyRange,
  amountToWords,
  formatMobileMoney,
  
  // Date formatters
  formatDate,
  formatDateTime,
  formatDateKE,
  formatRelativeTime,
  
  // Text formatters
  truncateText,
  formatPhoneNumber,
  formatOrderNumber,
  getInitials,
  maskSensitiveInfo,
  formatAddress,
  stringToColor,
  
  // Number formatters
  formatNumber,
  formatPercentage,
  formatSocialNumber,
  calculateDiscount,
  formatRating,
  
  // File/Size formatters
  formatFileSize,
  formatBytes,
  formatDuration,
  
  // Status formatters
  formatStatus,
  formatInventoryStatus,
  formatPriceRange,
  
  // Helper for number to words (exported for testing/edge cases)
  _numberToWords: numberToWords
};