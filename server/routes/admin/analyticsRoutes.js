// routes/admin/analyticsRoutes.js - CORRECTED VERSION
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';

// Import all controller functions directly (no dynamic import)
import {
  getDashboardAnalytics,
  getSalesReport,
  getCustomerAnalytics,
  getProductAnalytics,
  getSalesData,
  getRevenueStats,
  getCategorySales
} from '../../controllers/admin/analyticsController.js';

const router = express.Router();

// Add logging to verify imports
console.log('✅ Analytics Controller Functions Loaded:');
console.log('  • getDashboardAnalytics:', typeof getDashboardAnalytics === 'function' ? '✅' : '❌');
console.log('  • getSalesData:', typeof getSalesData === 'function' ? '✅' : '❌');
console.log('  • getRevenueStats:', typeof getRevenueStats === 'function' ? '✅' : '❌');
console.log('  • getCategorySales:', typeof getCategorySales === 'function' ? '✅' : '❌');
console.log('  • getSalesReport:', typeof getSalesReport === 'function' ? '✅' : '❌');
console.log('  • getCustomerAnalytics:', typeof getCustomerAnalytics === 'function' ? '✅' : '❌');
console.log('  • getProductAnalytics:', typeof getProductAnalytics === 'function' ? '✅' : '❌');

// All routes are protected
router.use(protect);

// Analytics endpoints
router.get('/dashboard', getDashboardAnalytics);
router.get('/sales', getSalesData);
router.get('/revenue', getRevenueStats);
router.get('/categories', getCategorySales);
router.get('/sales-report', getSalesReport);
router.get('/customers', getCustomerAnalytics);
router.get('/products', getProductAnalytics);

// Add a test route (optional - remove after testing)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Analytics routes are working!',
    endpoints: {
      dashboard: '/api/admin/analytics/dashboard',
      sales: '/api/admin/analytics/sales',
      revenue: '/api/admin/analytics/revenue',
      categories: '/api/admin/analytics/categories'
    }
  });
});

// Log registered routes
console.log('\n📋 Registered Analytics Routes:');
router.stack.forEach((layer) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
    const path = layer.route.path;
    console.log(`  ${methods.padEnd(6)} /api/admin/analytics${path}`);
  }
});

export default router;