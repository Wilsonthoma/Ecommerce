/**
 * Middleware to require email verification for critical actions
 * Use this on routes that should be locked until user verifies email
 */

/**
 * @desc    Require email verification for critical actions
 * @access  Private
 */
export const requireEmailVerification = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Check if email is verified
  if (!req.user.isAccountVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required to perform this action',
      code: 'EMAIL_NOT_VERIFIED',
      action: 'Please verify your email address',
      actionUrl: '/verify-email'
    });
  }

  next();
};

export default {
  requireEmailVerification
};