const Settings = require('../models/GlobalSettings');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// @desc    Get all settings for current user
// @route   GET /api/settings
// @access  Private
exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  // Create default settings if not exists
  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  res.status(200).json({
    success: true,
    settings
  });
});

// @desc    Get profile settings
// @route   GET /api/settings/profile
// @access  Private
exports.getProfileSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  res.status(200).json({
    success: true,
    profile: settings.profile
  });
});

// @desc    Update profile settings
// @route   PUT /api/settings/profile
// @access  Private
exports.updateProfileSettings = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  // Update profile fields
  const allowedFields = [
    'fullName', 'displayName', 'bio', 'phoneNumber',
    'alternateEmail', 'dateOfBirth', 'gender', 'language', 'timezone'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      settings.profile[field] = req.body[field];
    }
  });

  await settings.save();

  // Update user's name if fullName changed
  if (req.body.fullName) {
    await User.findByIdAndUpdate(req.user.id, { name: req.body.fullName });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    profile: settings.profile
  });
});

// @desc    Get notification settings
// @route   GET /api/settings/notifications
// @access  Private
exports.getNotificationSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  res.status(200).json({
    success: true,
    notifications: settings.notifications
  });
});

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private
exports.updateNotificationSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  // Update notification fields
  if (req.body.email) {
    settings.notifications.email = {
      ...settings.notifications.email,
      ...req.body.email
    };
  }

  if (req.body.sms) {
    settings.notifications.sms = {
      ...settings.notifications.sms,
      ...req.body.sms
    };
  }

  if (req.body.push) {
    settings.notifications.push = {
      ...settings.notifications.push,
      ...req.body.push
    };
  }

  if (req.body.frequency) {
    settings.notifications.frequency = req.body.frequency;
  }

  if (req.body.quietHours) {
    settings.notifications.quietHours = {
      ...settings.notifications.quietHours,
      ...req.body.quietHours
    };
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Notification settings updated successfully',
    notifications: settings.notifications
  });
});

// @desc    Get privacy settings
// @route   GET /api/settings/privacy
// @access  Private
exports.getPrivacySettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  res.status(200).json({
    success: true,
    privacy: settings.privacy
  });
});

// @desc    Update privacy settings
// @route   PUT /api/settings/privacy
// @access  Private
exports.updatePrivacySettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  // Update privacy fields
  const allowedFields = [
    'profileVisibility', 'showEmail', 'showPhone', 'showOrderHistory',
    'allowDataCollection', 'allowCookies', 'twoFactorAuth',
    'sessionTimeout', 'activityTracking', 'personalizedAds'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      settings.privacy[field] = req.body[field];
    }
  });

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Privacy settings updated successfully',
    privacy: settings.privacy
  });
});

// @desc    Get payment settings
// @route   GET /api/settings/payment
// @access  Private
exports.getPaymentSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  res.status(200).json({
    success: true,
    payment: settings.payment
  });
});

// @desc    Update payment settings
// @route   PUT /api/settings/payment
// @access  Private
exports.updatePaymentSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  // Update payment fields
  const allowedFields = [
    'defaultMethod', 'savePaymentMethods', 'autoPayEnabled', 'currency'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      settings.payment[field] = req.body[field];
    }
  });

  if (req.body.mpesa) {
    settings.payment.mpesa = {
      ...settings.payment.mpesa,
      ...req.body.mpesa
    };
  }

  if (req.body.paypal) {
    settings.payment.paypal = {
      ...settings.payment.paypal,
      ...req.body.paypal
    };
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Payment settings updated successfully',
    payment: settings.payment
  });
});

// @desc    Get shipping settings
// @route   GET /api/settings/shipping
// @access  Private
exports.getShippingSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  res.status(200).json({
    success: true,
    shipping: settings.shipping
  });
});

// @desc    Update shipping settings
// @route   PUT /api/settings/shipping
// @access  Private
exports.updateShippingSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  // Update shipping fields
  const allowedFields = [
    'preferredMethod', 'saveAddresses', 'internationalShipping',
    'packagingPreference', 'deliveryInstructions', 'safeDrop', 'signatureRequired'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      settings.shipping[field] = req.body[field];
    }
  });

  if (req.body.defaultAddress) {
    settings.shipping.defaultAddress = req.body.defaultAddress;
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Shipping settings updated successfully',
    shipping: settings.shipping
  });
});

// @desc    Get display settings
// @route   GET /api/settings/display
// @access  Private
exports.getDisplaySettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  res.status(200).json({
    success: true,
    display: settings.display
  });
});

// @desc    Update display settings
// @route   PUT /api/settings/display
// @access  Private
exports.updateDisplaySettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  // Update display fields
  const allowedFields = [
    'theme', 'compactView', 'itemsPerPage', 'currencyDisplay',
    'dateFormat', 'timeFormat'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      settings.display[field] = req.body[field];
    }
  });

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Display settings updated successfully',
    display: settings.display
  });
});

// @desc    Change password
// @route   POST /api/settings/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current and new password'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Check if new password is same as old
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return res.status(400).json({
      success: false,
      message: 'New password cannot be the same as current password'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Update security settings
  let settings = await Settings.findOne({ userId: req.user.id });
  if (settings) {
    settings.security.passwordLastChanged = Date.now();
    
    // Add to password history (keep last 5)
    settings.security.passwordHistory.push({
      password: await bcrypt.hash(newPassword, 10),
      changedAt: Date.now()
    });
    
    if (settings.security.passwordHistory.length > 5) {
      settings.security.passwordHistory.shift();
    }
    
    await settings.save();
  }

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Generate API key
// @route   POST /api/settings/generate-api-key
// @access  Private
exports.generateApiKey = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  // Generate random API key
  const apiKey = crypto.randomBytes(32).toString('hex');
  settings.api.apiKey = apiKey;

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'API key generated successfully',
    apiKey
  });
});

// @desc    Delete API key
// @route   DELETE /api/settings/api-key
// @access  Private
exports.deleteApiKey = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (settings) {
    settings.api.apiKey = null;
    await settings.save();
  }

  res.status(200).json({
    success: true,
    message: 'API key deleted successfully'
  });
});

// @desc    Add trusted device
// @route   POST /api/settings/trusted-devices
// @access  Private
exports.addTrustedDevice = asyncHandler(async (req, res) => {
  const { deviceName, userAgent } = req.body;

  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  const deviceId = crypto.randomBytes(16).toString('hex');

  settings.security.trustedDevices.push({
    deviceId,
    name: deviceName || 'Unknown Device',
    userAgent: userAgent || 'Unknown',
    lastUsed: Date.now()
  });

  // Keep only last 10 trusted devices
  if (settings.security.trustedDevices.length > 10) {
    settings.security.trustedDevices.shift();
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Device added to trusted list',
    deviceId
  });
});

// @desc    Remove trusted device
// @route   DELETE /api/settings/trusted-devices/:deviceId
// @access  Private
exports.removeTrustedDevice = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (settings) {
    settings.security.trustedDevices = settings.security.trustedDevices.filter(
      d => d.deviceId !== req.params.deviceId
    );
    await settings.save();
  }

  res.status(200).json({
    success: true,
    message: 'Device removed from trusted list'
  });
});

// @desc    Get security questions
// @route   GET /api/settings/security-questions
// @access  Private
exports.getSecurityQuestions = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  res.status(200).json({
    success: true,
    questions: settings.security.securityQuestions
  });
});

// @desc    Set security questions
// @route   POST /api/settings/security-questions
// @access  Private
exports.setSecurityQuestions = asyncHandler(async (req, res) => {
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide security questions'
    });
  }

  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  // Hash answers before storing
  settings.security.securityQuestions = await Promise.all(
    questions.map(async (q) => ({
      question: q.question,
      answer: await bcrypt.hash(q.answer.toLowerCase(), 10)
    }))
  );

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Security questions saved successfully'
  });
});

// @desc    Verify security answer
// @route   POST /api/settings/verify-security
// @access  Private
exports.verifySecurityAnswer = asyncHandler(async (req, res) => {
  const { questionIndex, answer } = req.body;

  const settings = await Settings.findOne({ userId: req.user.id });

  if (!settings || !settings.security.securityQuestions[questionIndex]) {
    return res.status(400).json({
      success: false,
      message: 'Security question not found'
    });
  }

  const isMatch = await bcrypt.compare(
    answer.toLowerCase(),
    settings.security.securityQuestions[questionIndex].answer
  );

  res.status(200).json({
    success: true,
    verified: isMatch
  });
});

// @desc    Generate backup codes
// @route   POST /api/settings/backup-codes
// @access  Private
exports.generateBackupCodes = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user.id });

  if (!settings) {
    settings = await Settings.createDefault(req.user.id);
  }

  // Generate 10 backup codes
  const backupCodes = [];
  for (let i = 0; i < 10; i++) {
    backupCodes.push({
      code: crypto.randomBytes(4).toString('hex').toUpperCase(),
      used: false
    });
  }

  settings.security.backupCodes = backupCodes;
  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Backup codes generated',
    codes: backupCodes.map(c => c.code)
  });
});

// @desc    Delete account
// @route   DELETE /api/settings/account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide your password'
    });
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Password is incorrect'
    });
  }

  // Delete user's settings
  await Settings.findOneAndDelete({ userId: req.user.id });

  // Delete user (cascading delete will be handled by database)
  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// @desc    Export all user data
// @route   GET /api/settings/export-data
// @access  Private
exports.exportData = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne({ userId: req.user.id });
  const user = await User.findById(req.user.id);

  const userData = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    },
    settings: settings || null
  };

  res.status(200).json({
    success: true,
    data: userData
  });
});