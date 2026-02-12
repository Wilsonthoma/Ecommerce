import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Security constants
const SECURITY = {
  TOKEN_EXPIRED: 'Token expired',
  TOKEN_INVALID: 'Invalid token',
  ACCESS_DENIED: 'Access denied',
  ACCOUNT_INACTIVE: 'Account is not active',
  ACCOUNT_SUSPENDED: 'Account is suspended'
};

/**
 * @desc    Authenticate user and attach to request object
 * @access  Private
 */
const userAuth = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in multiple locations
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    else if (req.query?.token) {
      token = req.query.token;
    }

    // 2. Validate token existence
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    // 3. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: SECURITY.TOKEN_EXPIRED,
          code: 'TOKEN_EXPIRED',
          action: 'Please login again'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: SECURITY.TOKEN_INVALID,
          code: 'TOKEN_INVALID'
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: SECURITY.ACCESS_DENIED,
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }

    // 4. Find user in database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User account no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    // 5. Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({ 
        success: false, 
        message: SECURITY.ACCOUNT_SUSPENDED,
        code: 'ACCOUNT_SUSPENDED',
        action: 'Please contact support'
      });
    }
    
    if (user.status === 'inactive') {
      return res.status(403).json({ 
        success: false, 
        message: SECURITY.ACCOUNT_INACTIVE,
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // 6. Update user's last activity
    const now = Date.now();
    if (!user.lastActivity || (now - new Date(user.lastActivity).getTime()) > 60000) {
      user.lastActivity = new Date(now);
      await user.save({ validateBeforeSave: false });
    }

    // ✅ FIXED: Attach COMPLETE user object with BOTH id and _id
    // ✅ FIXED: Use isAccountVerified to match User model
    req.user = {
      _id: user._id,
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAccountVerified: user.isAccountVerified,
      avatar: user.avatar,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    // Log successful authentication
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Authenticated: ${user.email} (${user.role}) - Verified: ${user.isAccountVerified}`);
    }

    next();

  } catch (error) {
    console.error('🔐 Auth Middleware Error:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    });

    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * @desc    Authorize by user role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (req.user.role === 'super-admin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access forbidden. Required role: ${roles.join(' or ')}`,
        code: 'ROLE_REQUIRED',
        currentRole: req.user.role,
        requiredRoles: roles
      });
    }

    next();
  };
};

/**
 * @desc    Require email verification
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.isAccountVerified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED',
      action: 'Please verify your email address'
    });
  }

  next();
};

/**
 * @desc    Optional authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (user && user.status === 'active') {
      req.user = {
        _id: user._id,
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAccountVerified: user.isAccountVerified
      };
    }

    next();
  } catch (error) {
    next();
  }
};

// Export all middleware functions
export {
  userAuth,
  authorize,
  requireEmailVerification,
  optionalAuth
};

export default userAuth;