// models/Settings.js
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Store Info
  storeName: {
    type: String,
    default: 'KwetuShop',
    trim: true
  },
  storeEmail: {
    type: String,
    default: 'info@kwetushop.com',
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },

  // Currency & Tax
  currency: {
    type: String,
    default: 'KES'
  },
  taxRate: {
    type: Number,
    default: 16,
    min: 0,
    max: 100
  },

  // Shipping
  shippingCost: {
    type: Number,
    default: 200,
    min: 0
  },
  freeShippingThreshold: {
    type: Number,
    default: 5000,
    min: 0
  },

  // Global Mode
  maintenanceMode: {
    type: Boolean,
    default: false
  },

  // Contact Info
  contactPhone: {
    type: String,
    default: '+254 700 000 000'
  },
  contactAddress: {
    type: String,
    default: 'Nairobi, Kenya'
  },

  // Social Links
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    youtube: String
  },

  // Audit
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Prevent multiple settings documents
settingsSchema.pre('save', async function (next) {
  const Settings = mongoose.model('Settings');

  const exists = await Settings.findOne({ _id: { $ne: this._id } });

  if (exists) {
    return next(new Error('Only one settings document is allowed.'));
  }

  next();
});

// Ensure quick lookup
settingsSchema.index({ storeName: 1 });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
