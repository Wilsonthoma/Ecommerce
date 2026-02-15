import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js'; // ✅ ADDED: Import User model
import config from '../config/env.js';

// ✅ FIXED: Import from your own errorHandler, NOT express-async-handler
import { asyncHandler } from './errorHandler.js';

/**
 * @desc    Protect routes - verify JWT token and attach admin to request
 * @access  Private (Admin only)
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (if using cookies)
  else if (req.cookies?.adminToken) {
    token = req.cookies.adminToken;
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token provided',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log(`✅ Token verified for admin ID: ${decoded.id}`);

    // Get admin from token
    const admin = await Admin.findById(decoded.id)
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');

    if (!admin) {
      console.log(`❌ Admin not found for ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, admin account not found',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    if (!admin.isActive) {
      console.log(`❌ Admin account deactivated: ${admin.email}`);
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach admin to request object
    req.admin = admin;
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    let errorMessage = 'Not authorized, token failed';
    let statusCode = 401;
    let errorCode = 'TOKEN_INVALID';

    if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
      errorCode = 'TOKEN_INVALID';
    } else if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expired';
      errorCode = 'TOKEN_EXPIRED';
      statusCode = 401;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
});

/**
 * @desc    Protect routes for regular users - verify JWT token and attach user to request
 * @access  Private (User only) - For reviews, wishlist, etc.
 */
export const protectUser = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (if using cookies)
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.log('❌ No user token provided');
    return res.status(401).json({
      success: false,
      error: 'Not authorized, please login',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log(`✅ Token verified for user ID: ${decoded.id}`);

    // Get user from token
    const user = await User.findById(decoded.id)
      .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      console.log(`❌ User not found for ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        error: 'User account not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      console.log(`❌ User account deactivated: ${user.email}`);
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    let errorMessage = 'Not authorized, token failed';
    let statusCode = 401;
    let errorCode = 'TOKEN_INVALID';

    if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
      errorCode = 'TOKEN_INVALID';
    } else if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expired';
      errorCode = 'TOKEN_EXPIRED';
      statusCode = 401;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
});

/**
 * @desc    Authenticate admin for notification routes
 */
export const authenticateAdmin = protect;

/**
 * @desc    Authorize by role - Accept multiple roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const admin = req.admin;

    // Super-admin bypass
    if (admin.role === 'super-admin') {
      return next();
    }

    // Check role
    if (!roles.includes(admin.role)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden. Required role: ${roles.join(' or ')}`,
        code: 'ROLE_REQUIRED',
        currentRole: admin.role,
        requiredRoles: roles
      });
    }

    next();
  };
};

/**
 * @desc    Check specific permission
 */
export const hasPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
        code: 'AUTH_REQUIRED'
      });
    }

    const admin = req.admin;

    // Super-admin has all permissions
    if (admin.role === 'super-admin') {
      return next();
    }

    // Check permissions
    if (!admin.permissions || 
        !admin.permissions[resource] || 
        !admin.permissions[resource][action]) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions for ${action} on ${resource}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

export default {
  protect,
  protectUser, // ✅ ADDED: Export the new user protection
  authorize,
  hasPermission,
  authenticateAdmin
};