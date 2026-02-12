// server/controllers/admin/userController.js
import asyncHandler from 'express-async-handler';
import User from '../../models/User.js';
import Order from '../../models/Order.js';

/**
 * @desc    Get all users with advanced filtering
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    role,
    status,
    verified,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Role filter
  if (role) {
    query.role = role;
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Verification filter
  if (verified !== undefined) {
    query.isVerified = verified === 'true';
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(query)
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Get available filters for UI
  const availableRoles = await User.distinct('role');

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? parseInt(page) + 1 : null,
      prevPage: hasPrevPage ? parseInt(page) - 1 : null
    },
    filters: {
      roles: availableRoles
    },
    data: users
  });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Get user order statistics
  const orderStats = await Order.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        avgOrderValue: { $avg: '$total' },
        lastOrder: { $max: '$placedAt' }
      }
    }
  ]);

  const userData = user.toObject();
  
  if (orderStats.length > 0) {
    userData.orderStats = {
      totalOrders: orderStats[0].totalOrders,
      totalSpent: orderStats[0].totalSpent,
      avgOrderValue: orderStats[0].avgOrderValue,
      lastOrder: orderStats[0].lastOrder
    };
  } else {
    userData.orderStats = {
      totalOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0,
      lastOrder: null
    };
  }

  res.status(200).json({
    success: true,
    data: userData
  });
});

/**
 * @desc    Create new user
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
export const createUser = asyncHandler(async (req, res) => {
  const { email, password, name, role = 'customer' } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      error: 'User with this email already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    isVerified: true, // Auto-verify admin-created users
    verifiedAt: new Date()
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    }
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Prevent updating super-admin unless you're a super-admin
  if (user.role === 'super-admin' && req.admin.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      error: 'Cannot update super-admin user'
    });
  }

  // Check email uniqueness if being updated
  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { 
      new: true, 
      runValidators: true 
    }
  ).select('-password -refreshToken');

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Prevent deleting super-admin
  if (user.role === 'super-admin') {
    return res.status(403).json({
      success: false,
      error: 'Cannot delete super-admin user'
    });
  }

  // Soft delete or archive
  user.status = 'archived';
  user.archivedAt = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User archived successfully',
    data: {
      id: user._id,
      email: user.email,
      status: user.status
    }
  });
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a role'
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Prevent updating super-admin role
  if (user.role === 'super-admin') {
    return res.status(403).json({
      success: false,
      error: 'Cannot change super-admin role'
    });
  }

  // Validate role
  const validRoles = ['customer', 'admin', 'editor', 'moderator'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      error: `Invalid role. Valid roles: ${validRoles.join(', ')}`
    });
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}`,
    data: {
      id: user._id,
      email: user.email,
      role: user.role
    }
  });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/admin/users/stats
 * @access  Private/Admin
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const [overview, roleStats, registrationStats, activityStats] = await Promise.all([
    // Overview statistics
    User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
          activeUsers: { $sum: { $cond: [{ $ne: ['$status', 'archived'] }, 1, 0] } },
          archivedUsers: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
          todayRegistrations: {
            $sum: {
              $cond: [
                {
                  $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))]
                },
                1,
                0
              ]
            }
          },
          weekRegistrations: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$createdAt',
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]),

    // Role distribution
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),

    // Registration by date (last 30 days)
    User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // User activity (last login)
    User.aggregate([
      {
        $bucket: {
          groupBy: '$lastLogin',
          boundaries: [
            new Date(0),
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            new Date(Date.now() - 24 * 60 * 60 * 1000),
            new Date()
          ],
          default: 'never',
          output: {
            count: { $sum: 1 },
            users: { $push: { email: '$email', name: '$name' } }
          }
        }
      }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: overview[0] || {},
      byRole: roleStats,
      registrations: registrationStats,
      activity: activityStats
    }
  });
});

/**
 * @desc    Bulk update users
 * @route   PUT /api/admin/users/bulk
 * @access  Private/Admin
 */
export const bulkUpdateUsers = asyncHandler(async (req, res) => {
  const { ids, action, data } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an array of user IDs'
    });
  }

  if (!action) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an action'
    });
  }

  let updateData = {};
  let message = '';

  switch (action) {
    case 'verify':
      updateData = { 
        isVerified: true,
        verifiedAt: new Date()
      };
      message = 'Users verified';
      break;
    
    case 'unverify':
      updateData = { isVerified: false };
      message = 'Users unverified';
      break;
    
    case 'activate':
      updateData = { status: 'active' };
      message = 'Users activated';
      break;
    
    case 'archive':
      updateData = { 
        status: 'archived',
        archivedAt: new Date()
      };
      message = 'Users archived';
      break;
    
    case 'updateRole':
      if (!data || !data.role) {
        return res.status(400).json({
          success: false,
          error: 'Please provide role data'
        });
      }
      updateData = { role: data.role };
      message = `Users role updated to ${data.role}`;
      break;
    
    case 'update':
      if (!data || typeof data !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Please provide update data'
        });
      }
      updateData = data;
      message = 'Users updated';
      break;
    
    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
  }

  // Prevent bulk updating super-admin users
  const result = await User.updateMany(
    { 
      _id: { $in: ids },
      role: { $ne: 'super-admin' } // Exclude super-admins
    },
    updateData
  );

  res.status(200).json({
    success: true,
    message: `${message} (${result.modifiedCount} users updated)`,
    data: result
  });
});