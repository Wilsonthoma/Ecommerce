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
    ref: 'Customer',
    required: true
  },
  customerEmail: String,
  customerName: String,
  customerPhone: String,

  // Shipping Address
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    apartment: String,
    city: String,
    country: String,
    state: String,
    zipCode: String,
    phone: String
  },

  // Billing Address
  billingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    apartment: String,
    city: String,
    country: String,
    state: String,
    zipCode: String,
    phone: String
  },

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    variant: String,
    quantity: Number,
    price: Number,
    image: String,
    subtotal: Number
  }],

  // Pricing
  subtotal: Number,
  shippingCost: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: Number,
  currency: { type: String, default: 'KES' },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'mpesa', 'cash_on_delivery', 'bank_transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,

  // Shipping Status
  shippingMethod: String,
  trackingNumber: String,
  carrier: String,

  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },

  // Date fields
  placedAt: { type: Date, default: Date.now },
  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  refundedAt: Date,

  // Notes
  customerNote: String,
  adminNote: String,

  // Fulfillment
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  fulfillmentDate: Date,

  // Metadata
  source: { type: String, default: 'website' },
  ipAddress: String,
  userAgent: String,

  conversionSource: String,
  marketingChannel: String
}, {
  timestamps: true
});

// Auto-generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(10000 + Math.random() * 90000);
    this.orderNumber = `KW-${dateStr}-${random}`;
  }
  next();
});

// Auto-calc totals
orderSchema.pre('save', function(next) {
  this.items.forEach(i => {
    i.subtotal = i.price * i.quantity;
  });

  this.subtotal = this.items.reduce((sum, i) => sum + i.subtotal, 0);

  this.totalAmount =
    this.subtotal + this.shippingCost + this.taxAmount - this.discountAmount;

  next();
});

// Update customer stats after delivered
orderSchema.post('save', async function(doc) {
  if (doc.status === 'delivered') {
    const Customer = mongoose.model('Customer');
    await Customer.findByIdAndUpdate(doc.customer, {
      $inc: { totalOrders: 1, totalSpent: doc.totalAmount },
      $set: { lastOrderDate: new Date() },
      $min: { firstOrderDate: doc.placedAt }
    });
  }
});

// Pagination
orderSchema.plugin(mongoosePaginate);

// Indexes (cleaned)
orderSchema.index({ customer: 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ placedAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ totalAmount: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
