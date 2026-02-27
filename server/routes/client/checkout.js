import express from 'express';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import { protectUser } from '../../middleware/authMiddleware.js';
import { validateCheckout } from '../../middleware/order.js';

const router = express.Router();

// ==================== MIDDLEWARE ====================

// Apply protection to all routes
router.use(protectUser);

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate shipping cost based on county and town
 * Enhanced to use town-specific rates
 */
const calculateShippingCost = (county, town) => {
  // This is a simplified version - in production, you'd have a database table
  // For now, we'll use county as the primary factor with some town variations
  const shippingRates = {
    'Nairobi': 150,
    'Mombasa': 200,
    'Kisumu': 180,
    'Kiambu': 170,
    'Nakuru': 160,
    'Uasin Gishu': 220,
    'Kakamega': 200,
    'Meru': 230,
    'Kilifi': 250,
    'Machakos': 190,
    'Kajiado': 200,
    'Kericho': 210,
    'Nyeri': 210,
    'Muranga': 190,
    'Kirinyaga': 210,
    'Embu': 220,
    'Kitui': 230,
    'Makueni': 220,
    'Nyandarua': 210,
    'Laikipia': 230,
    'Narok': 240,
    'Trans Nzoia': 240,
    'Bungoma': 230,
    'Busia': 240,
    'Vihiga': 220,
    'Kisii': 220,
    'Nyamira': 220,
    'Migori': 240,
    'Homa Bay': 240,
    'Siaya': 220,
    'Garissa': 350,
    'Wajir': 380,
    'Mandera': 400,
    'Marsabit': 380,
    'Isiolo': 280,
    'Samburu': 300,
    'Turkana': 380,
    'West Pokot': 280,
    'Baringo': 250,
    'Elgeyo Marakwet': 250,
    'Nandi': 220,
    'Lamu': 350,
    'Tana River': 300,
    'Taita Taveta': 260,
    'Kwale': 250,
    'Tharaka Nithi': 230
  };

  // Apply small adjustments for specific towns (optional)
  const townAdjustments = {
    'CBD': 0,
    'Westlands': -30,
    'Kilimani': -20,
    'Karen': 30,
    'Langata': 10,
    'Nyali': -20,
    'Bamburi': -10
  };

  const baseRate = shippingRates[county] || 300;
  const adjustment = townAdjustments[town] || 0;
  
  return Math.max(baseRate + adjustment, 0); // Ensure non-negative
};

/**
 * Validate items stock and prices
 */
const validateItems = async (items) => {
  const validatedItems = [];
  const errors = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      errors.push(`Product not found: ${item.productId}`);
      continue;
    }

    // Check if product is active and visible
    if (product.status !== 'active' || !product.visible) {
      errors.push(`${product.name} is no longer available`);
      continue;
    }

    // Check stock
    if (product.trackQuantity && product.quantity < item.quantity) {
      errors.push(`${product.name} has insufficient stock. Available: ${product.quantity}`);
      continue;
    }

    validatedItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images?.[0]?.url || product.thumbnail,
      subtotal: product.price * item.quantity
    });
  }

  return { validatedItems, errors };
};

/**
 * Apply promo code
 */
const applyPromoCode = async (code, subtotal) => {
  // This would normally check against a PromoCode model
  // For now, return dummy discounts
  const promoCodes = {
    'WELCOME10': { discount: 0.1, type: 'percentage' },
    'SAVE500': { discount: 500, type: 'fixed' }
  };

  const promo = promoCodes[code?.toUpperCase()];
  
  if (!promo) {
    return { discount: 0, message: 'Invalid promo code' };
  }

  let discount = 0;
  if (promo.type === 'percentage') {
    discount = subtotal * promo.discount;
  } else {
    discount = promo.discount;
  }

  return { 
    discount: Math.min(discount, subtotal),
    message: 'Promo code applied successfully'
  };
};

// ==================== CHECKOUT ROUTES ====================

/**
 * POST /api/client/checkout/validate
 * Validate checkout data before proceeding
 */
router.post('/validate', async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    const errors = {};

    // Validate items
    if (!items || items.length === 0) {
      errors.items = 'Cart is empty';
    } else {
      const { errors: itemErrors } = await validateItems(items);
      if (itemErrors.length > 0) {
        errors.items = itemErrors;
      }
    }

    // Validate shipping address - UPDATED to include town
    if (!shippingAddress) {
      errors.shippingAddress = 'Shipping address is required';
    } else {
      const requiredFields = ['fullName', 'addressLine', 'city', 'county', 'town', 'phone'];
      requiredFields.forEach(field => {
        if (!shippingAddress[field]) {
          errors[`shippingAddress.${field}`] = `${field} is required`;
        }
      });

      // Validate phone number format (Kenyan)
      if (shippingAddress.phone && !/^0\d{9}$/.test(shippingAddress.phone.replace(/\s/g, ''))) {
        errors[`shippingAddress.phone`] = 'Invalid Kenyan phone number';
      }
    }

    res.json({
      success: Object.keys(errors).length === 0,
      valid: Object.keys(errors).length === 0,
      errors
    });
  } catch (error) {
    console.error('Error validating checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Validation failed'
    });
  }
});

/**
 * POST /api/client/checkout/calculate
 * Calculate order totals (shipping, tax, discounts)
 */
router.post('/calculate', async (req, res) => {
  try {
    const { items, promoCode, shippingAddress } = req.body;

    // Calculate subtotal
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        subtotal += product.price * item.quantity;
      }
    }

    // Calculate shipping - UPDATED to use both county and town
    const shippingCost = shippingAddress?.county && shippingAddress?.town
      ? calculateShippingCost(shippingAddress.county, shippingAddress.town)
      : 0;

    // Calculate tax (16% VAT in Kenya) - only apply to taxable items if needed
    const taxAmount = subtotal * 0.16;

    // Apply promo code
    const { discount } = await applyPromoCode(promoCode, subtotal);

    // Calculate total
    const total = subtotal + shippingCost + taxAmount - discount;

    res.json({
      success: true,
      breakdown: {
        subtotal,
        shippingCost,
        taxAmount,
        discount,
        total: Math.max(total, 0)
      }
    });
  } catch (error) {
    console.error('Error calculating order totals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate totals'
    });
  }
});

/**
 * POST /api/client/checkout/place-order
 * Place a new order
 */
router.post('/place-order', async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      promoCode,
      customerNote
    } = req.body;

    // Validate required fields
    if (!items || !shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate items and calculate totals
    const { validatedItems, errors: itemErrors } = await validateItems(items);
    
    if (itemErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items are invalid',
        errors: itemErrors
      });
    }

    // Calculate subtotal
    const subtotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Calculate shipping - UPDATED to use both county and town
    const shippingCost = calculateShippingCost(shippingAddress.county, shippingAddress.town);

    // Calculate tax (16% VAT)
    const taxAmount = subtotal * 0.16;

    // Apply promo code
    const { discount } = await applyPromoCode(promoCode, subtotal);

    // Calculate total
    const totalAmount = subtotal + shippingCost + taxAmount - discount;

    // Format shipping address to match updated Order model
    const formattedShippingAddress = {
      fullName: shippingAddress.fullName,
      addressLine: shippingAddress.addressLine,
      city: shippingAddress.city,
      county: shippingAddress.county,
      town: shippingAddress.town,
      postalCode: shippingAddress.postalCode || '',
      phone: shippingAddress.phone,
      email: shippingAddress.email || req.user.email
    };

    // Create order with updated schema
    const order = new Order({
      orderNumber: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: req.user.id,
      customerEmail: req.user.email,
      customerName: shippingAddress.fullName,
      customerPhone: shippingAddress.phone,
      shippingAddress: formattedShippingAddress,
      items: validatedItems.map(item => ({
        ...item,
        productId: item.productId // Ensure productId is set correctly
      })),
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount: discount,
      totalAmount,
      paymentMethod,
      status: 'pending',
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'processing',
      customerNote: customerNote || '',
      statusHistory: [{
        status: 'pending',
        note: 'Order placed',
        changedBy: req.user.id
      }],
      source: 'website'
    });

    await order.save();

    // Return success response with order details
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error placing order:', error);
    
    // Handle duplicate order number (rare but possible)
    if (error.code === 11000) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique order number. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again.'
    });
  }
});

/**
 * POST /api/client/checkout/validate-promo
 * Validate a promo code
 */
router.post('/validate-promo', async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    const { discount, message } = await applyPromoCode(code, subtotal);

    if (discount > 0) {
      res.json({
        success: true,
        discount,
        message
      });
    } else {
      res.json({
        success: false,
        discount: 0,
        message: 'Invalid promo code'
      });
    }
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate promo code'
    });
  }
});

/**
 * GET /api/client/checkout/shipping-methods
 * Get available shipping methods
 */
router.get('/shipping-methods', async (req, res) => {
  try {
    const methods = [
      {
        id: 'standard',
        name: 'Standard Delivery',
        description: '3-5 business days',
        baseRate: 150
      },
      {
        id: 'express',
        name: 'Express Delivery',
        description: '1-2 business days',
        baseRate: 350
      },
      {
        id: 'pickup',
        name: 'Store Pickup',
        description: 'Pick up from our Nairobi store',
        baseRate: 0
      }
    ];

    res.json({
      success: true,
      methods
    });
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipping methods'
    });
  }
});

/**
 * POST /api/client/checkout/estimate-delivery
 * Get estimated delivery date
 */
router.post('/estimate-delivery', async (req, res) => {
  try {
    const { county, shippingMethod } = req.body;

    if (!county || !shippingMethod) {
      return res.status(400).json({
        success: false,
        message: 'County and shipping method are required'
      });
    }

    // Simple delivery estimation logic
    const today = new Date();
    let deliveryDate = new Date(today);

    if (shippingMethod === 'express') {
      deliveryDate.setDate(today.getDate() + 2);
    } else {
      deliveryDate.setDate(today.getDate() + 5);
    }

    // Add extra days for remote counties
    const remoteCounties = ['Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Turkana', 'Lamu'];
    if (remoteCounties.includes(county)) {
      deliveryDate.setDate(deliveryDate.getDate() + 3);
    }

    // Don't deliver on Sundays
    if (deliveryDate.getDay() === 0) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    }

    res.json({
      success: true,
      estimatedDelivery: deliveryDate,
      minDays: shippingMethod === 'express' ? 2 : 5,
      maxDays: shippingMethod === 'express' ? 3 : 7
    });
  } catch (error) {
    console.error('Error estimating delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to estimate delivery'
    });
  }
});

export default router;