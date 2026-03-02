// src/controllers/client/settingsController.js
import UserSettings from '../../models/UserSettings.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

// @desc    Get user settings
// @route   GET /api/client/settings
// @access  Private
export const getUserSettings = asyncHandler(async (req, res) => {
  const settings = await UserSettings.getUserSettings(req.user._id);
  
  res.json({
    success: true,
    settings
  });
});

// @desc    Update user settings
// @route   PUT /api/client/settings
// @access  Private
export const updateUserSettings = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  let settings = await UserSettings.findOne({ userId: req.user._id });
  
  if (!settings) {
    settings = new UserSettings({ userId: req.user._id });
  }

  // Update allowed sections
  const allowedSections = [
    'profile', 'notifications', 'privacy', 'display',
    'wishlist', 'orders', 'addressBook', 'security'
  ];

  allowedSections.forEach(section => {
    if (req.body[section]) {
      settings[section] = {
        ...settings[section].toObject(),
        ...req.body[section]
      };
    }
  });

  await settings.save();

  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings
  });
});

// @desc    Update notification preferences
// @route   PUT /api/client/settings/notifications
// @access  Private
export const updateNotifications = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  let settings = await UserSettings.findOne({ userId: req.user._id });
  
  if (!settings) {
    settings = new UserSettings({ userId: req.user._id });
  }

  settings.notifications = {
    ...settings.notifications.toObject(),
    ...req.body
  };

  await settings.save();

  res.json({
    success: true,
    message: 'Notification preferences updated',
    notifications: settings.notifications
  });
});

// @desc    Update display preferences
// @route   PUT /api/client/settings/display
// @access  Private
export const updateDisplay = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  let settings = await UserSettings.findOne({ userId: req.user._id });
  
  if (!settings) {
    settings = new UserSettings({ userId: req.user._id });
  }

  settings.display = {
    ...settings.display.toObject(),
    ...req.body
  };

  await settings.save();

  res.json({
    success: true,
    message: 'Display preferences updated',
    display: settings.display
  });
});

// @desc    Update privacy settings
// @route   PUT /api/client/settings/privacy
// @access  Private
export const updatePrivacy = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  let settings = await UserSettings.findOne({ userId: req.user._id });
  
  if (!settings) {
    settings = new UserSettings({ userId: req.user._id });
  }

  settings.privacy = {
    ...settings.privacy.toObject(),
    ...req.body
  };

  await settings.save();

  res.json({
    success: true,
    message: 'Privacy settings updated',
    privacy: settings.privacy
  });
});

// @desc    Update profile settings
// @route   PUT /api/client/settings/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  let settings = await UserSettings.findOne({ userId: req.user._id });
  
  if (!settings) {
    settings = new UserSettings({ userId: req.user._id });
  }

  settings.profile = {
    ...settings.profile.toObject(),
    ...req.body
  };

  await settings.save();

  res.json({
    success: true,
    message: 'Profile settings updated',
    profile: settings.profile
  });
});

// @desc    Reset user settings to default
// @route   POST /api/client/settings/reset
// @access  Private
export const resetUserSettings = asyncHandler(async (req, res) => {
  await UserSettings.findOneAndDelete({ userId: req.user._id });
  
  const settings = await UserSettings.create({ userId: req.user._id });

  res.json({
    success: true,
    message: 'Settings reset to default',
    settings
  });
});

// @desc    Get public profile settings
// @route   GET /api/client/settings/public-profile
// @access  Public
export const getPublicProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const settings = await UserSettings.findOne({ userId });
  
  if (!settings) {
    return res.status(404).json({
      success: false,
      message: 'User settings not found'
    });
  }

  const publicProfile = settings.getPublicProfile();
  
  if (!publicProfile) {
    return res.status(403).json({
      success: false,
      message: 'Profile is private'
    });
  }

  res.json({
    success: true,
    profile: publicProfile
  });
});