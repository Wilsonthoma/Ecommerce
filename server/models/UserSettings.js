// src/models/UserSettings.js
import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Profile Settings
  profile: {
    displayName: {
      type: String,
      trim: true,
      default: ''
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    language: {
      type: String,
      enum: ['en', 'sw', 'fr'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Africa/Nairobi'
    },
    dateFormat: {
      type: String,
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      default: 'DD/MM/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '24h'
    }
  },

  // Notification Settings
  notifications: {
    email: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
      accountAlerts: { type: Boolean, default: true },
      reviewResponses: { type: Boolean, default: true },
      abandonedCart: { type: Boolean, default: true },
      priceDrops: { type: Boolean, default: false },
      backInStock: { type: Boolean, default: true }
    },
    sms: {
      orderUpdates: { type: Boolean, default: false },
      promotions: { type: Boolean, default: false },
      deliveryAlerts: { type: Boolean, default: true },
      otpVerification: { type: Boolean, default: true }
    },
    push: {
      enabled: { type: Boolean, default: false },
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      chatMessages: { type: Boolean, default: true }
    },
    frequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly'],
      default: 'instant'
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '08:00' }
    }
  },

  // Privacy Settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'contacts'],
      default: 'public'
    },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showOrderHistory: { type: Boolean, default: true },
    allowDataCollection: { type: Boolean, default: true },
    allowCookies: { type: Boolean, default: true }
  },

  // Display Settings
  display: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'dark'
    },
    compactView: { type: Boolean, default: false },
    itemsPerPage: {
      type: Number,
      enum: [12, 24, 48, 96],
      default: 24
    },
    currency: {
      type: String,
      enum: ['KES', 'USD', 'EUR', 'GBP'],
      default: 'KES'
    },
    showPricesWithTax: { type: Boolean, default: false }
  },

  // Wishlist Settings
  wishlist: {
    notifyOnPriceDrop: { type: Boolean, default: true },
    notifyOnBackInStock: { type: Boolean, default: true },
    defaultSort: {
      type: String,
      enum: ['dateAdded', 'price', 'name'],
      default: 'dateAdded'
    }
  },

  // Order Settings
  orders: {
    defaultSort: {
      type: String,
      enum: ['newest', 'oldest', 'status'],
      default: 'newest'
    },
    showCompleted: { type: Boolean, default: true },
    showCancelled: { type: Boolean, default: false }
  },

  // Address Book Settings
  addressBook: {
    defaultAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address'
    },
    showSavedAddresses: { type: Boolean, default: true }
  },

  // Security Settings
  security: {
    loginNotifications: { type: Boolean, default: true },
    deviceTracking: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: false }
  },

  // Metadata
  metadata: {
    version: { type: Number, default: 1 },
    lastUpdated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Update version and timestamp
userSettingsSchema.pre('save', function(next) {
  this.metadata.version += 1;
  this.metadata.lastUpdated = new Date();
  next();
});

// Get or create user settings
userSettingsSchema.statics.getUserSettings = async function(userId) {
  let settings = await this.findOne({ userId });
  
  if (!settings) {
    settings = await this.create({ userId });
    console.log(`✅ Default settings created for user: ${userId}`);
  }
  
  return settings;
};

// Get public profile settings
userSettingsSchema.methods.getPublicProfile = function() {
  if (this.privacy.profileVisibility === 'private') {
    return null;
  }
  
  return {
    displayName: this.profile.displayName,
    bio: this.profile.bio,
    language: this.profile.language,
    timezone: this.profile.timezone,
    showEmail: this.privacy.showEmail ? this.profile.email : undefined,
    showPhone: this.privacy.showPhone ? this.profile.phoneNumber : undefined
  };
};

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
export default UserSettings;