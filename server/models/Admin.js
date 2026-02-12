import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const adminSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'super-admin'],
    default: 'admin'
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resetOtp: String,
  resetOtpExpires: Date,
  lastLogin: {
    type: Date
  }
  // Removed:
  // loginAttempts: {
  //   type: Number,
  //   default: 0
  // },
  // lockUntil: {
  //   type: Date
  // }
}, {
  timestamps: true
});

// Hash password before save
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Auto-update updatedAt field
adminSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Removed login attempts/lock functionality methods:
// adminSchema.methods.incLoginAttempts = async function() {
//   // Implementation removed
// };
// adminSchema.methods.isLocked = function() {
//   // Implementation removed
// };

// Virtuals
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

adminSchema.virtual('accountAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export default Admin;