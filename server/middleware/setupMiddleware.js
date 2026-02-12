import Admin from '../models/Admin.js';

export const checkSetupRequired = async (req, res, next) => {
  // Skip setup check for setup-related routes
  if (req.path.includes('/admin/auth/check-setup') || 
      req.path.includes('/admin/auth/setup') ||
      req.path.includes('/login')) {
    return next();
  }

  try {
    const adminCount = await Admin.countDocuments();
    
    // If no admin exists, setup is required
    if (adminCount === 0) {
      return res.status(403).json({
        success: false,
        error: 'System setup required',
        redirectTo: '/setup'
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};