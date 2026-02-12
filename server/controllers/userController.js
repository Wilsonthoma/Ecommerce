import User from '../models/User.js';

/**
 * @desc    Get current user data
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getUserData = async (req, res) => {
  try {
    // Get the authenticated user ID from middleware - support multiple formats
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    // Fetch complete user data from database
    const user = await User.findById(userId).select(
      'name email isAccountVerified role avatar phone status createdAt lastLogin'
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Return consistent user object structure
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ Get user data error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to get user data'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    const { name, phone, avatar } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Update fields if provided
    if (name) user.name = name.trim();
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isAccountVerified: user.isAccountVerified,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update profile'
    });
  }
};

export default {
  getUserData,
  updateUserProfile
};