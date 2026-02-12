/**
 * Application Constants
 * Centralized location for all magic strings, enums, and static values
 * This file should NEVER import from other files (except config/env.js if needed)
 */

// -------------------- ORDER CONSTANTS --------------------
export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    ON_HOLD: 'on_hold',
    PAYMENT_FAILED: 'payment_failed',
    AWAITING_PAYMENT: 'awaiting_payment',
    AWAITING_SHIPMENT: 'awaiting_shipment',
    PARTIALLY_SHIPPED: 'partially_shipped',
    PARTIALLY_REFUNDED: 'partially_refunded',
    RETURNED: 'returned',
    EXCHANGED: 'exchanged'
};

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Pending',
    [ORDER_STATUS.PROCESSING]: 'Processing',
    [ORDER_STATUS.SHIPPED]: 'Shipped',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled',
    [ORDER_STATUS.REFUNDED]: 'Refunded',
    [ORDER_STATUS.ON_HOLD]: 'On Hold',
    [ORDER_STATUS.PAYMENT_FAILED]: 'Payment Failed',
    [ORDER_STATUS.AWAITING_PAYMENT]: 'Awaiting Payment',
    [ORDER_STATUS.AWAITING_SHIPMENT]: 'Awaiting Shipment',
    [ORDER_STATUS.PARTIALLY_SHIPPED]: 'Partially Shipped',
    [ORDER_STATUS.PARTIALLY_REFUNDED]: 'Partially Refunded',
    [ORDER_STATUS.RETURNED]: 'Returned',
    [ORDER_STATUS.EXCHANGED]: 'Exchanged'
};

export const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.PENDING]: 'warning',
    [ORDER_STATUS.PROCESSING]: 'info',
    [ORDER_STATUS.SHIPPED]: 'primary',
    [ORDER_STATUS.DELIVERED]: 'success',
    [ORDER_STATUS.CANCELLED]: 'error',
    [ORDER_STATUS.REFUNDED]: 'secondary',
    [ORDER_STATUS.ON_HOLD]: 'default',
    [ORDER_STATUS.PAYMENT_FAILED]: 'error',
    [ORDER_STATUS.AWAITING_PAYMENT]: 'warning',
    [ORDER_STATUS.AWAITING_SHIPMENT]: 'info',
    [ORDER_STATUS.PARTIALLY_SHIPPED]: 'primary',
    [ORDER_STATUS.PARTIALLY_REFUNDED]: 'secondary'
};

// -------------------- PRODUCT CONSTANTS --------------------
export const PRODUCT_STATUS = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    OUT_OF_STOCK: 'out_of_stock',
    DISCONTINUED: 'discontinued',
    COMING_SOON: 'coming_soon'
};

export const PRODUCT_STATUS_LABELS = {
    [PRODUCT_STATUS.DRAFT]: 'Draft',
    [PRODUCT_STATUS.ACTIVE]: 'Active',
    [PRODUCT_STATUS.ARCHIVED]: 'Archived',
    [PRODUCT_STATUS.OUT_OF_STOCK]: 'Out of Stock',
    [PRODUCT_STATUS.DISCONTINUED]: 'Discontinued',
    [PRODUCT_STATUS.COMING_SOON]: 'Coming Soon'
};

// -------------------- USER CONSTANTS --------------------
export const USER_ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super-admin',
    MODERATOR: 'moderator',
    SUPPORT: 'support',
    MANAGER: 'manager'
};

export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    BANNED: 'banned',
    PENDING_VERIFICATION: 'pending_verification'
};

// -------------------- PAYMENT CONSTANTS --------------------
export const PAYMENT_METHODS = {
    CREDIT_CARD: 'credit_card',
    PAYPAL: 'paypal',
    COD: 'cod',
    BANK_TRANSFER: 'bank_transfer',
    STRIPE: 'stripe',
    MPESA: 'mpesa',
    GOOGLE_PAY: 'google_pay',
    APPLE_PAY: 'apple_pay'
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded',
    CANCELLED: 'cancelled'
};

// -------------------- SHIPPING CONSTANTS --------------------
export const SHIPPING_METHODS = {
    STANDARD: 'standard',
    EXPRESS: 'express',
    NEXT_DAY: 'next_day',
    INTERNATIONAL: 'international',
    FREE: 'free'
};

export const SHIPPING_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    PICKED_UP: 'picked_up',
    IN_TRANSIT: 'in_transit',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    RETURNED: 'returned'
};

// -------------------- CATEGORY CONSTANTS --------------------
export const PRODUCT_CATEGORIES = [
    'electronics',
    'clothing',
    'books',
    'home',
    'sports',
    'beauty',
    'toys',
    'automotive',
    'health',
    'food',
    'furniture',
    'jewelry',
    'music',
    'software',
    'pet_supplies',
    'office',
    'garden',
    'baby',
    'tools',
    'luggage'
];

export const CATEGORY_DISPLAY_NAMES = {
    electronics: 'Electronics',
    clothing: 'Clothing & Fashion',
    books: 'Books & Media',
    home: 'Home & Living',
    sports: 'Sports & Outdoors',
    beauty: 'Beauty & Personal Care',
    toys: 'Toys & Games',
    automotive: 'Automotive',
    health: 'Health & Wellness',
    food: 'Food & Beverages',
    furniture: 'Furniture',
    jewelry: 'Jewelry & Watches',
    music: 'Music & Instruments',
    software: 'Software & Digital',
    pet_supplies: 'Pet Supplies',
    office: 'Office Supplies',
    garden: 'Garden & Outdoor',
    baby: 'Baby & Kids',
    tools: 'Tools & Hardware',
    luggage: 'Luggage & Travel'
};

// -------------------- COUPON CONSTANTS --------------------
export const COUPON_TYPES = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
    FREE_SHIPPING: 'free_shipping',
    BUY_X_GET_Y: 'buy_x_get_y'
};

export const COUPON_APPLICABLE_TO = {
    ALL: 'all',
    CATEGORY: 'category',
    PRODUCT: 'product',
    CUSTOMER: 'customer',
    MINIMUM_PURCHASE: 'minimum_purchase'
};

// -------------------- REVIEW CONSTANTS --------------------
export const REVIEW_RATINGS = [1, 2, 3, 4, 5];

export const REVIEW_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FLAGGED: 'flagged'
};

// -------------------- NOTIFICATION CONSTANTS --------------------
export const NOTIFICATION_TYPES = {
    ORDER: 'order',
    PROMOTION: 'promotion',
    SYSTEM: 'system',
    PAYMENT: 'payment',
    SHIPPING: 'shipping',
    ACCOUNT: 'account',
    REVIEW: 'review'
};

export const NOTIFICATION_PRIORITY = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
};

// -------------------- CART CONSTANTS --------------------
export const CART_STATUS = {
    ACTIVE: 'active',
    ABANDONED: 'abandoned',
    CONVERTED: 'converted',
    EXPIRED: 'expired'
};

// -------------------- TAX CONSTANTS --------------------
export const TAX_RATES = {
    DEFAULT: 0.0, // Override with actual rates based on location
    STANDARD: 0.10,
    REDUCED: 0.05,
    ZERO: 0.00
};

// -------------------- DATE CONSTANTS --------------------
export const DATE_FORMATS = {
    DEFAULT: 'YYYY-MM-DD',
    DISPLAY: 'MMM DD, YYYY',
    DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    FILENAME: 'YYYYMMDD_HHmmss'
};

// -------------------- PAGINATION CONSTANTS --------------------
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    PAGE_SIZES: [10, 20, 50, 100]
};

// -------------------- FILE UPLOAD CONSTANTS --------------------
export const ALLOWED_FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
};

export const MAX_FILE_SIZES = {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    SPREADSHEET: 5 * 1024 * 1024 // 5MB
};

// -------------------- CACHE CONSTANTS --------------------
export const CACHE_KEYS = {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    SETTINGS: 'settings',
    USER: 'user',
    ORDER: 'order'
};

export const CACHE_TTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400 // 24 hours
};

// -------------------- API CONSTANTS --------------------
export const API = {
    VERSION: 'v1',
    PREFIX: '/api',
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 100
    }
};

// -------------------- REGEX PATTERNS --------------------
export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    OBJECT_ID: /^[0-9a-fA-F]{24}$/
};

// -------------------- ERROR CODES --------------------
export const ERROR_CODES = {
    // Authentication (1000-1999)
    UNAUTHORIZED: 1001,
    INVALID_CREDENTIALS: 1002,
    TOKEN_EXPIRED: 1003,
    TOKEN_INVALID: 1004,
    ACCOUNT_LOCKED: 1005,
    ACCOUNT_NOT_VERIFIED: 1006,
    
    // Authorization (2000-2999)
    FORBIDDEN: 2001,
    INSUFFICIENT_PERMISSIONS: 2002,
    ROLE_REQUIRED: 2003,
    
    // Resource (3000-3999)
    NOT_FOUND: 3001,
    ALREADY_EXISTS: 3002,
    CONFLICT: 3003,
    
    // Validation (4000-4999)
    VALIDATION_ERROR: 4001,
    INVALID_INPUT: 4002,
    MISSING_FIELD: 4003,
    
    // Business Logic (5000-5999)
    INSUFFICIENT_STOCK: 5001,
    ORDER_CANNOT_BE_CANCELLED: 5002,
    PAYMENT_FAILED: 5003,
    COUPON_EXPIRED: 5004,
    COUPON_LIMIT_REACHED: 5005,
    
    // System (9000-9999)
    INTERNAL_ERROR: 9001,
    SERVICE_UNAVAILABLE: 9002,
    DATABASE_ERROR: 9003,
    THIRD_PARTY_ERROR: 9004
};

// -------------------- EXPORT ALL CONSTANTS --------------------
export default {
    // Orders
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    ORDER_STATUS_COLORS,
    
    // Products
    PRODUCT_STATUS,
    PRODUCT_STATUS_LABELS,
    
    // Users
    USER_ROLES,
    USER_STATUS,
    
    // Payments
    PAYMENT_METHODS,
    PAYMENT_STATUS,
    
    // Shipping
    SHIPPING_METHODS,
    SHIPPING_STATUS,
    
    // Categories
    PRODUCT_CATEGORIES,
    CATEGORY_DISPLAY_NAMES,
    
    // Coupons
    COUPON_TYPES,
    COUPON_APPLICABLE_TO,
    
    // Reviews
    REVIEW_RATINGS,
    REVIEW_STATUS,
    
    // Notifications
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITY,
    
    // Cart
    CART_STATUS,
    
    // Tax
    TAX_RATES,
    
    // Date
    DATE_FORMATS,
    
    // Pagination
    PAGINATION,
    
    // File Upload
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZES,
    
    // Cache
    CACHE_KEYS,
    CACHE_TTL,
    
    // API
    API,
    
    // Regex
    REGEX,
    
    // Error Codes
    ERROR_CODES
};