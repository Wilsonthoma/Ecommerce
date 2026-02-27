// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
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

    // ✅ FIXED: Robust active check - checks both status and isActive fields
    const isActive = admin.isActive === true || admin.status === 'active';
    if (!isActive) {
      console.log(`❌ Admin account not active: ${admin.email}, isActive: ${admin.isActive}, status: ${admin.status}`);
      return res.status(403).json({
        success: false,
        error: 'Account is not active. Please contact support.',
        code: 'ACCOUNT_INACTIVE'
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
      .select('-password -resetPasswordToken -resetPasswordExpire -verifyOtp -resetOtp');

    if (!user) {
      console.log(`❌ User not found for ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        error: 'User account not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // ✅ FIXED: Check user active status - checks both status and isActive fields
    const isActive = user.isActive === true || user.status === 'active';
    if (!isActive) {
      console.log(`❌ User account not active: ${user.email}, isActive: ${user.isActive}, status: ${user.status}`);
      return res.status(403).json({
        success: false,
        error: 'Account is not active. Please contact support.',
        code: 'ACCOUNT_INACTIVE'
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
 * @desc    Middleware to restrict access to admin only
 * @access  Private (Admin only)
 */
export const admin = (req, res, next) => {
  // Check if user is authenticated as admin
  if (!req.admin && !req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated',
      code: 'AUTH_REQUIRED'
    });
  }

  // Check if user is admin (either through req.admin or req.user with admin role)
  const isAdmin = req.admin || (req.user && req.user.role === 'admin');
  
  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin only.',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
};

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

/**
 * @desc    Optional authentication - doesn't fail if no token
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select('-password');
    
    // ✅ FIXED: Check both status and isActive for optional auth
    if (user && (user.isActive === true || user.status === 'active')) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('⚠️ Optional auth failed:', error.message);
  }

  next();
});

/**
 * @desc    Check if user owns the resource or is admin
 */
export const checkOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user && !req.admin) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
          code: 'AUTH_REQUIRED'
        });
      }

      // Admin can access any resource
      if (req.admin && req.admin.role === 'super-admin') {
        return next();
      }

      const ownerId = await getResourceOwnerId(req);
      
      // Check if user owns the resource
      if (req.user && ownerId && ownerId.toString() === req.user.id.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource',
        code: 'ACCESS_DENIED'
      });
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking permissions',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * @desc    Generate JWT token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * @desc    Generate refresh token
 */
export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, config.jwt.refreshSecret || config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn || '7d'
  });
};

/**
 * @desc    Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret || config.jwt.secret);
};

export default {
  protect,
  protectUser,
  admin,                // ✅ ADDED: admin middleware
  authorize,
  hasPermission,
  authenticateAdmin,
  optionalAuth,
  checkOwnership,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
};