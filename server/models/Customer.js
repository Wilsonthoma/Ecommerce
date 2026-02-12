import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const customerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,                 // ✔ unique only (no schema.index duplicate)
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phone: String,

  accountId: String,
  isVerified: { type: Boolean, default: false },

  addresses: [{
    type: {
      type: String,
      enum: ['shipping', 'billing'],
      default: 'shipping'
    },
    firstName: String,
    lastName: String,
    address: String,
    apartment: String,
    city: String,
    country: String,
    state: String,
    zipCode: String,
    phone: String,
    isDefault: Boolean
  }],

  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  averageOrderValue: Number,

  firstOrderDate: Date,
  lastOrderDate: Date,
  accountCreated: { type: Date, default: Date.now },

  acceptsMarketing: { type: Boolean, default: false },

  tags: [String],

  notes: [{
    note: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdAt: { type: Date, default: Date.now }
  }],

  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active'
  },

  searchKeywords: [String]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Password hashing
customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Keyword indexing
customerSchema.pre('save', function (next) {
  this.searchKeywords = [
    this.firstName?.toLowerCase(),
    this.lastName?.toLowerCase(),
    this.email?.toLowerCase(),
    this.phone?.replace(/\D/g, '')
  ].filter(Boolean);

  next();
});

// Compare passwords
customerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtuals
customerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

customerSchema.virtual('defaultShippingAddress').get(function () {
  return this.addresses.find(a => a.type === 'shipping' && a.isDefault)
    || this.addresses.find(a => a.type === 'shipping')
    || null;
});

customerSchema.virtual('defaultBillingAddress').get(function () {
  return this.addresses.find(a => a.type === 'billing' && a.isDefault)
    || this.addresses.find(a => a.type === 'billing')
    || null;
});

// Clean indexes (no duplicates)
customerSchema.index({ firstName: 'text', lastName: 'text', email: 'text', searchKeywords: 'text' });
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ totalOrders: -1 });
customerSchema.index({ status: 1 });
customerSchema.index({ createdAt: -1 });

export default mongoose.model('Customer', customerSchema);
