import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['order', 'payment', 'user', 'system', 'warning', 'success', 'info'],
    default: 'info',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  read_at: {
    type: Date
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expires_at: {
    type: Date,
    index: true, // ✅ This creates the TTL index - KEEP THIS
    sparse: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// ✅ FIXED: Removed duplicate TTL index - already defined with index: true
// ❌ REMOVED: notificationSchema.index({ expires_at: 1 }, { 
//   expireAfterSeconds: 0,
//   partialFilterExpression: { expires_at: { $exists: true } }
// });

// ✅ KEEP these indexes (they are not duplicates)
notificationSchema.index({ user_id: 1, read: 1, created_at: -1 });
notificationSchema.index({ user_id: 1, type: 1, created_at: -1 });
notificationSchema.index({ user_id: 1, priority: 1, created_at: -1 });

// Virtual for checking if notification is expired
notificationSchema.virtual('is_expired').get(function() {
  if (!this.expires_at) return false;
  return this.expires_at < new Date();
});

// Virtual id field for compatibility with frontend
notificationSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.read_at = new Date();
  return this.save();
};

// Static method to create system notification
notificationSchema.statics.createSystemNotification = async function(userId, title, message, data = {}) {
  return this.create({
    user_id: userId,
    title,
    message,
    type: 'system',
    data,
    priority: data.priority || 'medium'
  });
};

// Static method to create order notification
notificationSchema.statics.createOrderNotification = async function(userId, orderId, orderNumber, status, amount) {
  return this.create({
    user_id: userId,
    title: `Order ${orderNumber} ${status}`,
    message: `Your order #${orderNumber} has been ${status}`,
    type: 'order',
    data: {
      order_id: orderId,
      order_number: orderNumber,
      status: status,
      amount: amount
    },
    priority: status === 'cancelled' ? 'high' : 'medium'
  });
};

// Static method to create payment notification
notificationSchema.statics.createPaymentNotification = async function(userId, paymentId, amount, status) {
  return this.create({
    user_id: userId,
    title: `Payment ${status}`,
    message: `Payment of $${amount.toFixed(2)} has been ${status}`,
    type: 'payment',
    data: {
      payment_id: paymentId,
      amount: amount,
      status: status
    },
    priority: status === 'failed' ? 'high' : 'medium'
  });
};

// Static method to get user notifications with pagination
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    limit = 20,
    offset = 0,
    includeRead = false,
    type,
    priority
  } = options;

  const query = { user_id: userId };
  
  if (!includeRead) {
    query.read = false;
  }
  
  if (type) {
    query.type = type;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  // Exclude expired notifications
  query.$or = [
    { expires_at: { $exists: false } },
    { expires_at: { $gt: new Date() } }
  ];

  const [notifications, total] = await Promise.all([
    this.find(query)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    notifications,
    total,
    hasMore: total > offset + notifications.length
  };
};

// Enable virtuals in toJSON and toObject
notificationSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

notificationSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;