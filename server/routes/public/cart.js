// server/routes/public/cart.js
import express from 'express';
import Product from '../../models/Product.js';

const router = express.Router();

// Helper function to get cart from session
const getCart = (req) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  return req.session.cart;
};

// Helper function to fetch complete product details with all images AND SHIPPING FIELDS
const enrichCartWithProducts = async (cart) => {
  if (!cart || cart.length === 0) return [];
  
  // Get all product IDs from cart
  const productIds = cart.map(item => item.productId);
  
  console.log('🔍 Looking for products with IDs:', productIds);
  
  // Fetch all products from database
  const products = await Product.find({ 
    $or: [
      { _id: { $in: productIds } },
      { id: { $in: productIds } }
    ]
  }).lean();
  
  console.log('📦 Found products:', products.length);
  
  // Create a map for quick lookup
  const productMap = {};
  products.forEach(product => {
    productMap[product._id.toString()] = product;
    productMap[product.sku] = product;
  });
  
  // Enrich cart items with ALL product details INCLUDING SHIPPING FIELDS
  return cart.map(item => {
    const product = productMap[item.productId];
    
    if (!product) {
      console.warn(`⚠️ Product not found for ID: ${item.productId}`);
      return {
        id: item.productId,
        productId: item.productId,
        name: 'Product Unavailable',
        price: 0,
        discountPrice: null,
        images: [],
        allImages: [],
        description: '',
        category: '',
        brand: '',
        weight: 0,
        stock: 0,
        inStock: false,
        status: 'unavailable',
        quantity: item.quantity,
        addedAt: item.addedAt,
        updatedAt: item.updatedAt,
        // Default shipping fields
        requiresShipping: true,
        freeShipping: false,
        flatShippingRate: 0,
        weight: 0,
        weightUnit: 'kg',
        dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
        shippingClass: 'standard',
        internationalShipping: false,
        shippingZones: [],
        estimatedDeliveryMin: null,
        estimatedDeliveryMax: null
      };
    }
    
    // Calculate discount
    const discountPrice = product.comparePrice && product.comparePrice > product.price 
      ? product.price 
      : null;
    
    // Get ALL images with their details
    const allImages = product.images?.map(img => ({
      url: img.url,
      altText: img.altText || product.name,
      isPrimary: img.isPrimary || false
    })) || [];
    
    // If no images, add a placeholder
    if (allImages.length === 0) {
      allImages.push({
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        altText: product.name,
        isPrimary: true
      });
    }
    
    // Determine stock status based on product data
    const stockQuantity = product.quantity || 0;
    const trackQuantity = product.trackQuantity !== false;
    const allowOutOfStock = product.allowOutOfStockPurchase || false;
    
    let stockStatus = 'available';
    let inStock = true;
    
    if (trackQuantity) {
      if (stockQuantity <= 0 && !allowOutOfStock) {
        stockStatus = 'sold';
        inStock = false;
      } else if (stockQuantity <= 0 && allowOutOfStock) {
        stockStatus = 'backorder';
        inStock = true;
      } else if (stockQuantity <= (product.lowStockThreshold || 10)) {
        stockStatus = 'low';
        inStock = true;
      } else {
        stockStatus = 'available';
        inStock = true;
      }
    }
    
    // Log shipping fields for debugging
    console.log(`📦 Shipping fields for ${product.name}:`, {
      requiresShipping: product.requiresShipping,
      freeShipping: product.freeShipping,
      flatShippingRate: product.flatShippingRate,
      weight: product.weight,
      weightUnit: product.weightUnit,
      dimensions: product.dimensions,
      shippingClass: product.shippingClass,
      internationalShipping: product.internationalShipping,
      shippingZones: product.shippingZones,
      estimatedDeliveryMin: product.estimatedDeliveryMin,
      estimatedDeliveryMax: product.estimatedDeliveryMax
    });
    
    return {
      id: product._id,
      productId: product._id,
      name: product.name || 'Product',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price || 0,
      discountPrice: discountPrice,
      comparePrice: product.comparePrice || null,
      images: allImages,
      primaryImage: allImages.find(img => img.isPrimary) || allImages[0],
      category: product.category || '',
      tags: product.tags || [],
      vendor: product.vendor || '',
      featured: product.featured || false,
      
      // Stock fields
      weight: product.weight || 0,
      stockQuantity: stockQuantity,
      trackQuantity: trackQuantity,
      allowOutOfStock: allowOutOfStock,
      lowStockThreshold: product.lowStockThreshold || 10,
      inStock: inStock,
      stockStatus: stockStatus,
      sku: product.sku || '',
      
      // ✅ SHIPPING FIELDS - All of them!
      requiresShipping: product.requiresShipping !== false, // Default to true
      freeShipping: product.freeShipping || false,
      flatShippingRate: product.flatShippingRate || 0,
      weight: product.weight || 0,
      weightUnit: product.weightUnit || 'kg',
      dimensions: product.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
      shippingClass: product.shippingClass || 'standard',
      internationalShipping: product.internationalShipping || false,
      shippingZones: product.shippingZones || [],
      estimatedDeliveryMin: product.estimatedDeliveryMin || null,
      estimatedDeliveryMax: product.estimatedDeliveryMax || null,
      
      // Cart metadata
      quantity: item.quantity,
      addedAt: item.addedAt,
      updatedAt: item.updatedAt
    };
  });
};

// GET cart items with complete product details
router.get('/', async (req, res) => {
  try {
    const cart = getCart(req);
    console.log('📦 Raw cart from session:', cart);
    
    // Enrich cart with product details from database
    const enrichedCart = await enrichCartWithProducts(cart);
    
    // Calculate totals
    const totalItems = enrichedCart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = enrichedCart.reduce((sum, item) => {
      const price = item.discountPrice || item.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    res.json({
      success: true,
      cart: {
        items: enrichedCart,
        totalQuantity: totalItems,
        totalPrice: subtotal
      },
      itemCount: enrichedCart.length,
      totalItems
    });
  } catch (err) {
    console.error('❌ Error fetching cart:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      cart: { items: [], totalQuantity: 0, totalPrice: 0 }
    });
  }
});

// POST add item to cart
router.post('/items', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    console.log('🛒 Adding to cart:', { productId, quantity });
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Verify product exists in database
    const product = await Product.findById(productId).lean();
    
    if (!product) {
      console.error(`❌ Product not found in database: ${productId}`);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Log shipping fields from product
    console.log(`📦 Product ${product.name} shipping fields:`, {
      requiresShipping: product.requiresShipping,
      freeShipping: product.freeShipping,
      flatShippingRate: product.flatShippingRate,
      weight: product.weight,
      shippingClass: product.shippingClass
    });
    
    // Check if product is available
    const trackQuantity = product.trackQuantity !== false;
    const stockQuantity = product.quantity || 0;
    const allowOutOfStock = product.allowOutOfStockPurchase || false;
    
    if (trackQuantity && stockQuantity <= 0 && !allowOutOfStock) {
      return res.status(400).json({
        success: false,
        message: 'This product is out of stock'
      });
    }
    
    const qty = Math.max(1, parseInt(quantity));
    const cart = getCart(req);
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart[existingItemIndex].quantity += qty;
      cart[existingItemIndex].updatedAt = new Date();
    } else {
      // Add new item
      cart.push({
        productId,
        quantity: qty,
        addedAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Get enriched cart for response
    const enrichedCart = await enrichCartWithProducts(cart);
    const totalItems = enrichedCart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = enrichedCart.reduce((sum, item) => {
      const price = item.discountPrice || item.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    res.json({
      success: true,
      message: 'Item added to cart',
      cart: {
        items: enrichedCart,
        totalQuantity: totalItems,
        totalPrice: subtotal
      }
    });
  } catch (err) {
    console.error('❌ Error adding to cart:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// PUT update cart item quantity
router.put('/items/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }
    
    const cart = getCart(req);
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart[itemIndex].quantity = quantity;
      cart[itemIndex].updatedAt = new Date();
    }
    
    // Get enriched cart for response
    const enrichedCart = await enrichCartWithProducts(cart);
    const totalItems = enrichedCart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = enrichedCart.reduce((sum, item) => {
      const price = item.discountPrice || item.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      cart: {
        items: enrichedCart,
        totalQuantity: totalItems,
        totalPrice: subtotal
      }
    });
  } catch (err) {
    console.error('❌ Error updating cart:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
});

// DELETE remove item from cart
router.delete('/items/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = getCart(req);
    const initialLength = cart.length;
    
    req.session.cart = cart.filter(item => item.productId !== productId);
    
    // Get enriched cart for response
    const enrichedCart = await enrichCartWithProducts(req.session.cart);
    const totalItems = enrichedCart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = enrichedCart.reduce((sum, item) => {
      const price = item.discountPrice || item.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    res.json({
      success: true,
      message: initialLength > req.session.cart.length 
        ? 'Item removed from cart' 
        : 'Item not found in cart',
      cart: {
        items: enrichedCart,
        totalQuantity: totalItems,
        totalPrice: subtotal
      }
    });
  } catch (err) {
    console.error('❌ Error removing from cart:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// DELETE clear entire cart
router.delete('/clear', async (req, res) => {
  try {
    req.session.cart = [];
    
    res.json({
      success: true,
      message: 'Cart cleared',
      cart: {
        items: [],
        totalQuantity: 0,
        totalPrice: 0
      }
    });
  } catch (err) {
    console.error('❌ Error clearing cart:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

export default router;