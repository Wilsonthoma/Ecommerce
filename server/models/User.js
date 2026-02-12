import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  oauth: {
    google: {
      type: String,
      sparse: true,
      unique: true
    }
  },
  
  avatar: {
    type: String,
    default: ''
  },
  
  phone: {
    type: String,
    default: ''
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Kenya'
    },
    postalCode: String
  },
  
  // ✅ ACCOUNT VERIFICATION STATUS
  isAccountVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // ✅ PASSWORD RESET OTP FIELDS
  resetOtp: {
    type: String,
    select: false
  },
  resetOtpExpiredAt: {
    type: Date,
    select: false
  },
  resetOtpVerified: {
    type: Boolean,
    default: false,
    select: false
  },
  resetOtpVerifiedAt: {
    type: Date,
    select: false
  },
  failedOtpAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  otpLockoutUntil: {
    type: Date,
    select: false
  },
  
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  
  lockUntil: Date,
  
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: {
    type: String,
    select: false
  },
  
  // ✅ EMAIL VERIFICATION OTP FIELDS
  verifyOtp: {
    type: String,
    select: false
  },
  verifyOtpExpiredAt: {
    type: Date,
    select: false
  },
  
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin', 'super-admin'],
    default: 'customer'
  },
  
  permissions: [{
    type: String,
    enum: [
      'read:products', 'write:products', 'delete:products',
      'read:orders', 'write:orders', 'delete:orders',
      'read:users', 'write:users', 'delete:users',
      'read:analytics', 'write:analytics'
    ]
  }],
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  
  lastLogin: Date,
  lastActivity: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    currency: {
      type: String,
      default: 'KES'
    },
    language: {
      type: String,
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  
  metadata: {
    signupSource: {
      type: String,
      enum: ['website', 'mobile', 'google', 'facebook'],
      default: 'website'
    },
    ipAddress: String,
    userAgent: String,
    referralCode: String,
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // Remove all sensitive fields
      delete ret.password;
      delete ret.twoFactorSecret;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      delete ret.verifyOtp;
      delete ret.verifyOtpExpiredAt;
      delete ret.resetOtp;
      delete ret.resetOtpExpiredAt;
      delete ret.resetOtpVerified;
      delete ret.resetOtpVerifiedAt;
      delete ret.failedOtpAttempts;
      delete ret.otpLockoutUntil;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'metadata.referredBy': 1 });
userSchema.index({ resetOtpExpiredAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { resetOtpExpiredAt: { $exists: true } } });
userSchema.index({ verifyOtpExpiredAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { verifyOtpExpiredAt: { $exists: true } } });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// ==================== PRE-SAVE HOOKS ====================

/**
 * Hash password before saving
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  // Check if already hashed
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Update timestamps before save
 */
userSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// ==================== INSTANCE METHODS ====================

/**
 * Compare password with hash
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if account is locked
 */
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

/**
 * Increment login attempts
 */
userSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 };
  }
  
  return await this.updateOne(updates);
};

/**
 * Reset login attempts
 */
userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

/**
 * Generate email verification token (legacy)
 */
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return token;
};

/**
 * Generate password reset token (legacy)
 */
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// ==================== EMAIL VERIFICATION OTP METHODS ====================

/**
 * Generate OTP for email verification
 */
userSchema.methods.generateVerifyOtp = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.verifyOtp = otp;
  this.verifyOtpExpiredAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.failedOtpAttempts = 0;
  this.otpLockoutUntil = undefined;
  
  return otp;
};

/**
 * Verify email verification OTP - FULLY FIXED
 */
userSchema.methods.verifyEmailOtp = function(enteredOtp) {
  // Check if OTP exists
  if (!this.verifyOtp) {
    return { 
      isValid: false, 
      message: 'No OTP found. Please request a new code.'
    };
  }
  
  // Check if OTP is expired
  if (this.verifyOtpExpiredAt < Date.now()) {
    // Clear expired OTP
    this.verifyOtp = undefined;
    this.verifyOtpExpiredAt = undefined;
    return { 
      isValid: false, 
      message: 'OTP has expired. Please request a new code.'
    };
  }
  
  // Check if OTP matches
  if (this.verifyOtp !== enteredOtp) {
    this.failedOtpAttempts = (this.failedOtpAttempts || 0) + 1;
    
    if (this.failedOtpAttempts >= 5) {
      this.otpLockoutUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
    }
    
    return { 
      isValid: false, 
      message: 'Invalid OTP',
      attemptsRemaining: Math.max(0, 5 - (this.failedOtpAttempts || 0))
    };
  }
  
  // ✅ OTP is valid - clear it and mark account as verified
  this.verifyOtp = undefined;
  this.verifyOtpExpiredAt = undefined;
  this.failedOtpAttempts = 0;
  this.otpLockoutUntil = undefined;
  this.isAccountVerified = true;
  
  return { 
    isValid: true, 
    message: 'Email verified successfully'
  };
};

// ==================== PASSWORD RESET OTP METHODS ====================

/**
 * Generate OTP for password reset
 */
userSchema.methods.generateResetOtp = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.resetOtp = otp;
  this.resetOtpExpiredAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.resetOtpVerified = false;
  this.resetOtpVerifiedAt = null;
  this.failedOtpAttempts = 0;
  this.otpLockoutUntil = undefined;
  
  return otp;
};

/**
 * Verify password reset OTP
 */
userSchema.methods.verifyResetOtp = function(enteredOtp) {
  // Check if OTP exists
  if (!this.resetOtp) {
    return { 
      isValid: false, 
      message: 'No OTP found. Please request a new code.'
    };
  }
  
  // Check if OTP is expired
  if (this.resetOtpExpiredAt < Date.now()) {
    this.resetOtp = undefined;
    this.resetOtpExpiredAt = undefined;
    return { 
      isValid: false, 
      message: 'OTP has expired. Please request a new code.'
    };
  }
  
  // Check if account is locked
  if (this.otpLockoutUntil && this.otpLockoutUntil > Date.now()) {
    const minutesLeft = Math.ceil((this.otpLockoutUntil - Date.now()) / (60 * 1000));
    return { 
      isValid: false, 
      message: `Too many failed attempts. Try again in ${minutesLeft} minutes.`
    };
  }
  
  // Check if OTP matches
  if (this.resetOtp !== enteredOtp) {
    this.failedOtpAttempts = (this.failedOtpAttempts || 0) + 1;
    
    if (this.failedOtpAttempts >= 5) {
      this.otpLockoutUntil = Date.now() + 15 * 60 * 1000;
    }
    
    return { 
      isValid: false, 
      message: 'Invalid OTP',
      attemptsRemaining: Math.max(0, 5 - (this.failedOtpAttempts || 0))
    };
  }
  
  // OTP is valid
  this.resetOtpVerified = true;
  this.resetOtpVerifiedAt = new Date();
  this.failedOtpAttempts = 0;
  this.otpLockoutUntil = undefined;
  
  return { 
    isValid: true, 
    message: 'OTP verified successfully. You can now reset your password.'
  };
};

/**
 * Clear password reset OTP data
 */
userSchema.methods.clearResetOtpData = function() {
  this.resetOtp = undefined;
  this.resetOtpExpiredAt = undefined;
  this.resetOtpVerified = false;
  this.resetOtpVerifiedAt = undefined;
  this.failedOtpAttempts = 0;
  this.otpLockoutUntil = undefined;
};

// ==================== PERMISSION METHODS ====================

/**
 * Check if user has permission
 */
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super-admin') return true;
  
  if (this.role === 'admin') {
    const adminPermissions = [
      'read:products', 'write:products', 'delete:products',
      'read:orders', 'write:orders', 'delete:orders',
      'read:users', 'write:users', 'read:analytics'
    ];
    return adminPermissions.includes(permission);
  }
  
  return this.permissions?.includes(permission) || false;
};

// ==================== UTILITY METHODS ====================

/**
 * Get safe user object (no sensitive data)
 */
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  
  const sensitiveFields = [
    'password', 'twoFactorSecret', 'loginAttempts', 'lockUntil',
    'verifyOtp', 'verifyOtpExpiredAt', 'resetOtp', 'resetOtpExpiredAt',
    'resetOtpVerified', 'resetOtpVerifiedAt', 'failedOtpAttempts',
    'otpLockoutUntil', 'passwordResetToken', 'passwordResetExpires',
    'emailVerificationToken', 'emailVerificationExpires'
  ];
  
  sensitiveFields.forEach(field => delete userObject[field]);
  
  return userObject;
};

/**
 * Check if email is verified
 */
userSchema.virtual('isVerified').get(function() {
  return this.isAccountVerified === true;
});

const User = mongoose.model('User', userSchema);
export default User;