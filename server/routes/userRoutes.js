
import express from 'express';
import userAuth from '../middleware/userAuth.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';

const router = express.Router();

// Apply authentication to all user routes
router.use(userAuth);

// ==================== USER PROFILE ====================

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -__v');
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        location: user.location,
        isAccountVerified: user.isAccountVerified,
        authMethod: user.oauth?.google ? 'google' : 'traditional',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, location, avatar, bio } = req.body;
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (avatar) user.avatar = avatar;
    if (bio) user.bio = bio;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar,
        bio: user.bio,
        isAccountVerified: user.isAccountVerified
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// ==================== USER STATS ====================

// Get user stats (orders count, total spent, etc.)
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get orders for this user
    const orders = await Order.find({ userId });
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed');
    const totalSpent = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const pendingOrders = orders.filter(o => ['pending', 'processing'].includes(o.status)).length;
    
    res.json({
      success: true,
      stats: {
        totalOrders,
        totalSpent,
        averageOrderValue,
        pendingOrders
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stats',
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        pendingOrders: 0
      }
    });
  }
});

// ==================== USER ORDERS ====================

// Get user orders (with pagination)
router.get('/orders', async (req, res) => {
  try {
    const { limit = 10, page = 1, status } = req.query;
    const userId = req.user._id;
    
    let query = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      orders: orders || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders',
      orders: []
    });
  }
});

// Get single order details
router.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    const order = await Order.findOne({ _id: orderId, userId }).lean();
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order details' 
    });
  }
});

// ==================== USER REVIEWS ====================

// Get user reviews count
router.get('/reviews/count', async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Review.countDocuments({ userId });
    
    res.json({
      success: true,
      count: count || 0
    });
  } catch (error) {
    console.error('Error fetching reviews count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews count',
      count: 0
    });
  }
});

// Get user reviews
router.get('/reviews', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const userId = req.user._id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find({ userId })
      .populate('productId', 'name images price')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Review.countDocuments({ userId });
    
    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews' 
    });
  }
});

// ==================== USER WISHLIST ====================

// Get user wishlist
router.get('/wishlist', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name price images rating reviewsCount')
      .select('wishlist');
    
    res.json({
      success: true,
      wishlist: user?.wishlist || []
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch wishlist' 
    });
  }
});

// Add to wishlist
router.post('/wishlist/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    
    if (!user.wishlist) user.wishlist = [];
    
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }
    
    user.wishlist.push(productId);
    await user.save();
    
    res.json({
      success: true,
      message: 'Added to wishlist',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add to wishlist' 
    });
  }
});

// Remove from wishlist
router.delete('/wishlist/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    
    res.json({
      success: true,
      message: 'Removed from wishlist',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove from wishlist' 
    });
  }
});

// ==================== ADDRESS BOOK ====================

// Get user addresses
router.get('/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json({
      success: true,
      addresses: user?.addresses || []
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch addresses' 
    });
  }
});

// Add address
router.post('/addresses', async (req, res) => {
  try {
    const { type, fullName, phone, addressLine, city, state, postalCode, country, isDefault } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user.addresses) user.addresses = [];
    
    const newAddress = {
      id: Date.now().toString(),
      type: type || 'home',
      fullName,
      phone,
      addressLine,
      city,
      state,
      postalCode,
      country: country || 'Kenya',
      isDefault: isDefault || user.addresses.length === 0
    };
    
    // If this is default, unset others
    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    user.addresses.push(newAddress);
    await user.save();
    
    res.json({
      success: true,
      message: 'Address added successfully',
      address: newAddress,
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add address' 
    });
  }
});

// Update address
router.put('/addresses/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;
    const updates = req.body;
    const user = await User.findById(req.user._id);
    
    const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Update address
    user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...updates };
    
    // Handle default address
    if (updates.isDefault) {
      user.addresses.forEach((addr, idx) => {
        if (idx !== addressIndex) addr.isDefault = false;
      });
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update address' 
    });
  }
});

// Delete address
router.delete('/addresses/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    
    const deletedAddress = user.addresses.find(addr => addr.id === addressId);
    user.addresses = user.addresses.filter(addr => addr.id !== addressId);
    
    // If we deleted the default address and there are others, set first as default
    if (deletedAddress?.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete address' 
    });
  }
});

// ==================== PAYMENT METHODS ====================

// Get user payment methods
router.get('/payment-methods', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('paymentMethods');
    res.json({
      success: true,
      paymentMethods: user?.paymentMethods || []
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment methods' 
    });
  }
});

// Add payment method
router.post('/payment-methods', async (req, res) => {
  try {
    const { type, last4, expiry, name, isDefault } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user.paymentMethods) user.paymentMethods = [];
    
    const newMethod = {
      id: Date.now().toString(),
      type,
      last4,
      expiry,
      name,
      isDefault: isDefault || user.paymentMethods.length === 0
    };
    
    if (newMethod.isDefault) {
      user.paymentMethods.forEach(m => m.isDefault = false);
    }
    
    user.paymentMethods.push(newMethod);
    await user.save();
    
    res.json({
      success: true,
      message: 'Payment method added successfully',
      paymentMethods: user.paymentMethods
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add payment method' 
    });
  }
});

// Delete payment method
router.delete('/payment-methods/:methodId', async (req, res) => {
  try {
    const { methodId } = req.params;
    const user = await User.findById(req.user._id);
    
    const deletedMethod = user.paymentMethods.find(m => m.id === methodId);
    user.paymentMethods = user.paymentMethods.filter(m => m.id !== methodId);
    
    if (deletedMethod?.isDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Payment method deleted successfully',
      paymentMethods: user.paymentMethods
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete payment method' 
    });
  }
});

// ==================== ACCOUNT SETTINGS ====================

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to change password' 
    });
  }
});

// Delete account
router.delete('/account', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete account' 
    });
  }
});

export default router;