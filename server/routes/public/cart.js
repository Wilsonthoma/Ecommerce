import express from 'express';
const router = express.Router();

// For now, using session storage. In production, you'd want to use a database.
// This is a simplified implementation.

// Helper function to get cart from session
const getCart = (req) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  return req.session.cart;
};

// GET cart items with totals
router.get('/', (req, res) => {
  try {
    const cart = getCart(req);
    
    // Calculate totals
    const cartSummary = {
      items: cart,
      itemCount: cart.length,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
      // Note: You'd need to fetch product prices from database for accurate total
    };

    res.json({
      success: true,
      ...cartSummary
    });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
});

// POST add item to cart
router.post('/items', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
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
    
    res.json({
      success: true,
      message: 'Item added to cart',
      cartCount: cart.length,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// PUT update cart item quantity
router.put('/items/:productId', (req, res) => {
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
    
    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      cartCount: cart.length,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
});

// DELETE remove item from cart
router.delete('/items/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = getCart(req);
    const initialLength = cart.length;
    
    req.session.cart = cart.filter(item => item.productId !== productId);
    
    res.json({
      success: true,
      message: initialLength > req.session.cart.length 
        ? 'Item removed from cart' 
        : 'Item not found in cart',
      cartCount: req.session.cart.length,
      totalItems: req.session.cart.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// DELETE clear entire cart
router.delete('/clear', (req, res) => {
  try {
    req.session.cart = [];
    
    res.json({
      success: true,
      message: 'Cart cleared',
      cartCount: 0,
      totalItems: 0
    });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

export default router;