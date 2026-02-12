import express, { Router } from 'express';
import mongoose from 'mongoose';
import os from 'os';
import { createRequire } from 'module';

// Use the CJS require shim for JSON files
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const router = Router();

// -------------------------------------------------------------------------
// 1. PUBLIC / CUSTOMER ROUTES IMPORTS
// -------------------------------------------------------------------------
import publicProductRoutes from './public/products.js';
import publicCategoryRoutes from './public/categories.js';
// ❌ REMOVED: import userAuthRoutes from './public/auth.js'; (file deleted)
import cartRoutes from './public/cart.js';
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// 2. ADMIN ROUTES IMPORTS 
// -------------------------------------------------------------------------
import adminAuthRoutes from './admin/authRoutes.js';
import adminProductRoutes from './admin/productRoutes.js';
import adminOrderRoutes from './admin/orderRoutes.js';
import adminAnalyticsRoutes from './admin/analyticsRoutes.js';
import adminCustomerRoutes from './admin/customerRoutes.js';
import adminUserRoutes from './admin/userRoutes.js';
import uploadRoutes from './admin/uploadRoutes.js';
import settingsRoutes from './admin/settingsRoutes.js';
import adminRoutes from './admin/adminRoutes.js';
import adminManagementRoutes from './admin/adminManagementRoutes.js';
import adminNotificationRoutes from './admin/notificationRoutes.js';
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// 3. IMPORT THE COMPREHENSIVE AUTH ROUTES
// -------------------------------------------------------------------------
import authRouter from './authRoutes.js'; // ✅ Comprehensive auth with Google OAuth
// -------------------------------------------------------------------------

// ------------------
// Mount public routes
// ------------------
// These routes should be accessible at /api/products, /api/categories, etc.
router.use('/products', publicProductRoutes);
router.use('/categories', publicCategoryRoutes);
router.use('/cart', cartRoutes);

// ------------------
// Mount COMPREHENSIVE auth routes (Google OAuth + traditional auth)
// ------------------
router.use('/auth', authRouter); // ✅ Now includes Google OAuth + everything

// ------------------
// Mount admin routes
// ------------------
router.use('/admin/auth', adminAuthRoutes);
router.use('/admin/products', adminProductRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/analytics', adminAnalyticsRoutes);
router.use('/admin/customers', adminCustomerRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/admin/admins', adminRoutes);
router.use('/admin/management', adminManagementRoutes);
router.use('/admin/upload', uploadRoutes);
router.use('/admin/settings', settingsRoutes);
router.use('/admin/notifications', adminNotificationRoutes);

// ------------------
// Quick Test Routes for Debugging
// ------------------
router.get('/test-products', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Products endpoint test',
    available_endpoints: [
      'GET /api/products',
      'GET /api/products/featured',
      'GET /api/products/:id',
      'GET /api/categories'
    ],
    note: 'Make sure public/products.js and public/categories.js are properly imported'
  });
});

// ------------------
// Legacy Endpoint Redirects
// ------------------
router.get('/users', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Note: User management endpoint has changed',
    current_endpoint: '/api/admin/users',
    legacy_endpoint: '/api/users',
    action_required: 'Please update your frontend to use /api/admin/users',
    data: [],
    count: 0,
    pagination: {
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    }
  });
});

router.post('/users', (req, res) => {
  res.status(301).json({
    success: false,
    error: 'Endpoint moved permanently',
    message: 'User management has moved to /api/admin/users',
    new_endpoint: '/api/admin/users',
    documentation: 'Please update your API calls to the new endpoint'
  });
});

router.get('/users/:id', (req, res) => {
  res.status(301).json({
    success: false,
    error: 'Endpoint moved permanently',
    message: 'User endpoints have moved to /api/admin/users',
    new_endpoint: `/api/admin/users/${req.params.id}`,
    action: 'Redirect your API calls to the new endpoint'
  });
});

// ------------------
// Debug endpoint
// ------------------
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/routes', (req, res) => {
    const routes = [];
    
    const extractRoutes = (routerStack, basePath = '') => {
      routerStack.forEach((layer) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
          routes.push({
            method: methods,
            path: basePath + layer.route.path,
            type: 'direct'
          });
        } else if (layer.name === 'router' || layer.name === 'bound dispatch') {
          const routerPath = basePath + (layer.regexp.fast_slash ? '' : 
            layer.regexp.toString()
              .replace('/^', '')
              .replace('\\/?(?=\\/|$)', '')
              .replace(/\/\^\\\//g, '/')
              .replace('\\/', '/')
              .replace('(?:([^\\/]+?))', ':param')
              .replace('(?=\\/|$)', '')
              .replace(/\(\?\:\/\)/g, '')
              .replace(/\/\(\.\*\?\)\//g, '/:param/')
              .replace(/\\\/\?/g, '')
              .replace(/\?/g, '')
              .replace(/\/\^/g, '')
              .replace(/\$/g, '')
              .replace(/\\/g, '')
          );
          
          if (layer.handle && layer.handle.stack) {
            extractRoutes(layer.handle.stack, routerPath);
          }
        }
      });
    };
    
    extractRoutes(router.stack, '/api');
    
    res.status(200).json({
      success: true,
      message: 'Available API routes',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      total_routes: routes.length,
      routes: routes.sort((a, b) => a.path.localeCompare(b.path))
    });
  });
}

// ------------------
// Health check endpoint
// ------------------
router.get('/health', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const serverIPs = [];
  
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        serverIPs.push(iface.address);
      }
    });
  });

  res.status(200).json({
    success: true,
    message: '🚀 E-Commerce API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    server: {
      hostname: os.hostname(),
      platform: os.platform(),
      architecture: os.arch(),
      ip_addresses: serverIPs,
      cpu_cores: os.cpus().length,
      total_memory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`,
      free_memory: `${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host || 'not connected',
      name: mongoose.connection.name || 'not connected'
    },
    environment: process.env.NODE_ENV || 'development',
    version: packageJson.version || '1.0.0',
    endpoints: {
      // ✅ UPDATED: Now correctly reflects the routes
      auth: '/api/auth', // Comprehensive auth with Google OAuth
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      admin_users: '/api/admin/users',
      admin_customers: '/api/admin/customers',
      admin_products: '/api/admin/products',
      admin_notifications: '/api/admin/notifications'
    }
  });
});

// ------------------
// API info endpoint
// ------------------
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🛒 E-Commerce API',
    description: 'Complete e-commerce platform with admin dashboard',
    version: packageJson.version || '1.0.0',
    documentation: {
      swagger: '/api-docs',
      postman: 'Available on request'
    },
    status: 'operational',
    maintenance: false,
    uptime: process.uptime(),
    endpoints: {
      public: {
        products: {
          list: 'GET /api/products',
          featured: 'GET /api/products/featured',
          single: 'GET /api/products/:id',
          search: 'GET /api/products?search=:query'
        },
        categories: 'GET /api/categories',
        auth: {
          // ✅ UPDATED: Now all auth endpoints are in one place
          google_login: 'GET /api/auth/google',
          google_callback: 'GET /api/auth/google/callback',
          login: 'POST /api/auth/login',
          register: 'POST /api/auth/register',
          refresh: 'POST /api/auth/refresh-token',
          password_reset: {
            send_otp: 'POST /api/auth/send-reset-otp',
            verify_otp: 'POST /api/auth/verify-reset-otp',
            reset: 'POST /api/auth/reset-password'
          },
          email_verification: {
            send_otp: 'POST /api/auth/send-verify-otp',
            verify: 'POST /api/auth/verify-email'
          },
          logout: 'POST /api/auth/logout',
          check_auth: 'GET /api/auth/is-auth',
          csrf_token: 'GET /api/auth/csrf-token'
        },
        cart: {
          view: 'GET /api/cart',
          add: 'POST /api/cart',
          update: 'PUT /api/cart/:itemId',
          clear: 'DELETE /api/cart'
        }
      },
      admin: {
        auth: {
          login: 'POST /api/admin/auth/login',
          setup: 'POST /api/admin/auth/setup',
          profile: 'GET /api/admin/auth/me'
        },
        users: {
          list: 'GET /api/admin/users',
          create: 'POST /api/admin/users',
          single: 'GET /api/admin/users/:id',
          update: 'PUT /api/admin/users/:id',
          delete: 'DELETE /api/admin/users/:id',
          stats: 'GET /api/admin/users/stats'
        },
        customers: {
          list: 'GET /api/admin/customers',
          single: 'GET /api/admin/customers/:id',
          stats: 'GET /api/admin/customers/stats'
        },
        products: {
          list: 'GET /api/admin/products',
          create: 'POST /api/admin/products',
          bulk_update: 'PUT /api/admin/products/bulk',
          stats: 'GET /api/admin/products/stats'
        },
        orders: 'GET /api/admin/orders',
        analytics: 'GET /api/admin/analytics',
        upload: 'POST /api/admin/upload',
        settings: 'GET /api/admin/settings',
        notifications: {
          list: 'GET /api/admin/notifications',
          stats: 'GET /api/admin/notifications/stats',
          mark_read: 'PATCH /api/admin/notifications/:id/read',
          mark_all_read: 'POST /api/admin/notifications/mark-all-read',
          delete: 'DELETE /api/admin/notifications/:id',
          create: 'POST /api/admin/notifications',
          clear_all: 'DELETE /api/admin/notifications'
        },
        health: 'GET /api/health'
      }
    },
    limits: {
      rate_limit: '100 requests per 15 minutes',
      upload_size: '10MB per request',
      pagination: 'Default 20 items per page, max 100'
    },
    support: {
      email: process.env.SUPPORT_EMAIL || 'support@example.com',
      status_page: process.env.STATUS_PAGE_URL || 'N/A'
    }
  });
});

// ------------------
// 404 handler
// ------------------
router.use('*', (req, res) => {
  const suggestions = [];
  const originalUrl = req.originalUrl;
  
  const commonMistakes = {
    '/api/users': '/api/admin/users or /api/admin/customers',
    '/api/user': '/api/admin/users',
    '/api/admin/user': '/api/admin/users',
    '/api/customer': '/api/admin/customers',
    '/api/product': '/api/products or /api/admin/products',
    '/api/order': '/api/admin/orders',
    '/api/notification': '/api/admin/notifications',
    '/api/admin/notification': '/api/admin/notifications',
    // ✅ UPDATED: Suggestions for auth endpoints
    '/api/auth-new/i/send-reset-otp': '/api/auth/send-reset-otp',
    '/api/auth-new/i/verify-reset-otp': '/api/auth/verify-reset-otp',
    '/api/auth-new/i/reset-password': '/api/auth/reset-password',
    '/api/auth-new/i/verify-email': '/api/auth/verify-email',
    '/api/auth-new/i/send-verify-otp': '/api/auth/send-verify-otp',
    '/api/auth-new/i/google': '/api/auth/google',
    '/api/auth-new/i/google/callback': '/api/auth/google/callback',
    '/api/auth-new/google': '/api/auth/google',
    '/api/auth-new/google/callback': '/api/auth/google/callback',
    '/api/auth-new/i/register': '/api/auth/register',
    '/api/auth-new/i/login': '/api/auth/login',
    '/api/auth-new/i/csrf-token': '/api/auth/csrf-token',
    // Add suggestions for product endpoints
    '/products/featured': '/api/products/featured',
    '/products': '/api/products',
    '/categories': '/api/categories'
  };
  
  let suggestion = '';
  for (const [wrong, correct] of Object.entries(commonMistakes)) {
    if (originalUrl.startsWith(wrong)) {
      suggestion = correct;
      break;
    }
  }
  
  const response = {
    success: false,
    error: `API endpoint ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
    method: req.method
  };
  
  if (suggestion) {
    response.suggestion = `Did you mean: ${suggestion}?`;
  }
  
  response.available_endpoints = {
    auth: '/api/auth', // ✅ All auth endpoints now unified here
    products: '/api/products',
    categories: '/api/categories',
    cart: '/api/cart',
    admin_users: '/api/admin/users',
    admin_customers: '/api/admin/customers',
    admin_products: '/api/admin/products',
    admin_notifications: '/api/admin/notifications',
    health_check: '/api/health',
    api_docs: '/api/'
  };
  
  response.troubleshooting = [
    'Check if you are using the correct HTTP method (GET, POST, PUT, DELETE)',
    'Verify the endpoint path is correct',
    'Ensure you have proper authentication headers for protected routes',
    'Check the API documentation at /api'
  ];
  
  res.status(404).json(response);
});

export default router;