// controllers/admin/adminManagementController.js

import asyncHandler from 'express-async-handler';
// import bcrypt from 'bcryptjs'; // REMOVED: bcryptjs is not directly used in these controller methods
import Admin from '../../models/Admin.js';

// Helper to format admin response
const formatAdminResponse = (admin) => ({
  id: admin._id,
  firstName: admin.firstName,
  lastName: admin.lastName,
  fullName: admin.fullName,
  email: admin.email,
  role: admin.role,
  permissions: admin.permissions,
  avatar: admin.avatar,
  phone: admin.phone,
  isActive: admin.isActive,
  lastLogin: admin.lastLogin,
  createdAt: admin.createdAt
});

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private/SuperAdmin
export const getAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: admins.length,
    admins: admins.map(formatAdminResponse)
  });
});

// Alias for compatibility
export const getAllAdmins = getAdmins;

// @desc    Get admin by ID
// @route   GET /api/admin/admins/:id
// @access  Private/SuperAdmin
export const getAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id).select('-password');
  
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }
  
  res.json({
    success: true,
    admin: formatAdminResponse(admin)
  });
});

// Alias for compatibility
export const getAdminById = getAdmin;

// @desc    Create new admin
// @route   POST /api/admin/admins
// @access  Private/SuperAdmin
export const createAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, permissions, phone } = req.body;
  
  // Check if admin already exists
  const adminExists = await Admin.findOne({ email });
  
  if (adminExists) {
    res.status(400);
    throw new Error('Admin with this email already exists');
  }
  
  // Create admin
  const admin = await Admin.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'admin',
    permissions: permissions || [],
    phone: phone || ''
  });
  
  if (admin) {
    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: formatAdminResponse(admin)
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin data');
  }
});

// @desc    Update admin
// @route   PUT /api/admin/admins/:id
// @access  Private/SuperAdmin
export const updateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }
  
  const { firstName, lastName, email, role, permissions, phone, isActive, avatar } = req.body;
  
  // Check if email is being changed and if it's already taken
  if (email && email !== admin.email) {
    const emailExists = await Admin.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
    admin.email = email;
  }
  
  // Update fields
  if (firstName) admin.firstName = firstName;
  if (lastName) admin.lastName = lastName;
  if (role) admin.role = role;
  if (permissions) admin.permissions = permissions;
  if (phone !== undefined) admin.phone = phone;
  if (isActive !== undefined) admin.isActive = isActive;
  if (avatar) admin.avatar = avatar;
  
  const updatedAdmin = await admin.save();
  
  res.json({
    success: true,
    message: 'Admin updated successfully',
    admin: formatAdminResponse(updatedAdmin)
  });
});

// @desc    Update admin permissions
// @route   PUT /api/admin/admins/:id/permissions
// @access  Private/SuperAdmin
export const updateAdminPermissions = asyncHandler(async (req, res) => {
  const { permissions } = req.body;
  
  if (!permissions || !Array.isArray(permissions)) {
    res.status(400);
    throw new Error('Permissions array is required');
  }
  
  const admin = await Admin.findById(req.params.id);
  
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }
  
  admin.permissions = permissions;
  const updatedAdmin = await admin.save();
  
  res.json({
    success: true,
    message: 'Permissions updated successfully',
    permissions: updatedAdmin.permissions
  });
});

// @desc    Toggle admin status
// @route   PUT /api/admin/admins/:id/status
// @access  Private/SuperAdmin
export const toggleAdminStatus = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }
  
  admin.isActive = !admin.isActive;
  await admin.save();
  
  res.json({
    success: true,
    message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
    isActive: admin.isActive
  });
});

// @desc    Delete admin
// @route   DELETE /api/admin/admins/:id
// @access  Private/SuperAdmin
export const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }
  
  // Prevent deleting yourself
  if (admin._id.toString() === req.admin._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  
  await admin.deleteOne();
  
  res.json({
    success: true,
    message: 'Admin removed successfully'
  });
});

// @desc    Change admin password
// @route   PUT /api/admin/admins/:id/password
// @access  Private/SuperAdmin
export const changeAdminPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }
  
  const admin = await Admin.findById(req.params.id);
  
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }
  
  // NOTE: Password hashing logic should be handled in the Admin model pre-save hook
  admin.password = newPassword;
  await admin.save();
  
  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Get admin activity logs
// @route   GET /api/admin/admins/:id/activity
// @access  Private/SuperAdmin
export const getAdminActivity = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id).select('activityLogs');
  
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }
  
  res.json({
    success: true,
    activityLogs: admin.activityLogs || []
  });
});

// @desc    Update admin profile (for current logged in admin)
// @route   PUT /api/admin/admins/profile
// @access  Private/Admin
export const updateProfile = asyncHandler(async (req, res) => {
  // NOTE: This assumes req.admin has been set by the protect middleware
  const admin = await Admin.findById(req.admin._id); 
  
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }
  
  const { firstName, lastName, phone, avatar } = req.body;
  
  if (firstName) admin.firstName = firstName;
  if (lastName) admin.lastName = lastName;
  if (phone !== undefined) admin.phone = phone;
  if (avatar) admin.avatar = avatar;
  
  const updatedAdmin = await admin.save();
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    admin: formatAdminResponse(updatedAdmin)
  });
});