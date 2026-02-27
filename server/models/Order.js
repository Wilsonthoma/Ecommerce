import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },

  // Customer Info
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Changed from 'Customer' to 'User' for consistency
    required: true
  },
  customerEmail: String,
  customerName: String,
  customerPhone: String,

  // Shipping Address - UPDATED to match frontend
  shippingAddress: {
    fullName: { type: String, required: true }, // Combined first/last
    addressLine: { type: String, required: true }, // Street address
    city: { type: String, required: true },
    county: { type: String, required: true }, // Kenyan county
    town: { type: String, required: true }, // NEW: Town/Area
    postalCode: String,
    phone: { type: String, required: true },
    email: String // Optional
  },

  // Billing Address (optional - can be same as shipping)
  billingAddress: {
    fullName: String,
    addressLine: String,
    city: String,
    county: String,
    town: String,
    postalCode: String,
    phone: String,
    email: String
  },

  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Changed from 'product'
    name: String,
    variant: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: String,
    subtotal: { type: Number, required: true, min: 0 }
  }],

  // Pricing
  subtotal: { type: Number, required: true, min: 0 },
  shippingCost: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'KES', uppercase: true },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'cash_on_delivery', 'bank_transfer'], // Simplified to match frontend
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'], // Added 'paid'
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    mpesaCode: String,
    paidAt: Date,
    paymentReference: String
  },

  // Delivery
  deliveryMethod: {
    type: String,
    enum: ['standard', 'express', 'pickup'],
    default: 'standard'
  },
  trackingNumber: String,
  carrier: String,
  estimatedDelivery: Date,

  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Date fields
  placedAt: { type: Date, default: Date.now },
  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  refundedAt: Date,

  // Notes
  customerNote: String,
  adminNotes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],

  // Fulfillment
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fulfillmentDate: Date,

  // Metadata
  source: { type: String, default: 'website' },
  ipAddress: String,
  userAgent: String,
  promoCode: String
}, {
  timestamps: true
});

// Auto-generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000);
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

// Auto-calc totals
orderSchema.pre('save', function(next) {
  // Calculate item subtotals
  this.items.forEach(item => {
    item.subtotal = item.price * item.quantity;
  });

  // Calculate order subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Calculate total amount
  this.totalAmount = this.subtotal + this.shippingCost + this.taxAmount - this.discountAmount;

  // Ensure total is not negative
  if (this.totalAmount < 0) this.totalAmount = 0;

  next();
});

// Track status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      note: `Status changed to ${this.status}`,
      changedAt: new Date()
    });

    // Set timestamps based on status
    const now = new Date();
    switch (this.status) {
      case 'paid':
        if (!this.paidAt) this.paidAt = now;
        break;
      case 'shipped':
        this.shippedAt = now;
        break;
      case 'delivered':
        this.deliveredAt = now;
        break;
      case 'cancelled':
        this.cancelledAt = now;
        break;
      case 'refunded':
        this.refundedAt = now;
        break;
    }
  }
  next();
});

// Update customer stats after delivered
orderSchema.post('save', async function(doc) {
  if (doc.status === 'delivered' && doc.isNew) {
    try {
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(doc.customer, {
        $inc: { 
          totalOrders: 1, 
          totalSpent: doc.totalAmount 
        },
        $set: { lastOrderDate: new Date() }
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }
});

// Update product quantities after order is placed
orderSchema.post('save', async function(doc) {
  if (doc.status === 'pending' && doc.isNew) {
    try {
      const Product = mongoose.model('Product');
      
      // Decrease quantity for each product
      for (const item of doc.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { quantity: -item.quantity, totalSold: item.quantity }
        });
      }
    } catch (error) {
      console.error('Error updating product quantities:', error);
    }
  }
});

// Instance methods
orderSchema.methods.canCancel = function() {
  return ['pending', 'processing'].includes(this.status);
};

orderSchema.methods.canReturn = function() {
  if (this.status !== 'delivered') return false;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.deliveredAt > thirtyDaysAgo;
};

// Static methods
orderSchema.statics.findByUser = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ customer: userId })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('items.productId', 'name images price');
};

orderSchema.statics.getStats = async function(userId = null) {
  const match = userId ? { customer: userId } : {};
  
  const stats = await this.aggregate([
    { $match: match },
    { $group: {
      _id: null,
      totalOrders: { $sum: 1 },
      totalSpent: { $sum: '$totalAmount' },
      avgOrderValue: { $avg: '$totalAmount' },
      pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
      processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
      shipped: { $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] } },
      delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
      cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
    }}
  ]);

  return stats[0] || {
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };
};

// Indexes
orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'items.productId': 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

// Text search index
orderSchema.index({ 
  orderNumber: 'text', 
  customerName: 'text',
  customerEmail: 'text',
  customerPhone: 'text'
});

// Pagination
orderSchema.plugin(mongoosePaginate);

const Order = mongoose.model('Order', orderSchema);
export default Order;