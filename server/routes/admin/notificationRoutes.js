// routes/admin/notificationRoutes.js
import express from 'express';
import Notification from '../../models/Notification.js';
import { authenticateAdmin, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

// GET /admin/notifications - Get user notifications
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔍 Notification route - Admin:', {
      id: req.admin?._id,
      email: req.admin?.email,
      name: req.admin?.name
    });
    
    const { 
      limit = 20, 
      offset = 0, 
      include_read = false,
      sort = 'created_at:desc',
      type,
      priority
    } = req.query;

    // Build query - FIXED: Changed from req.user.id to req.admin._id
    const query = { user_id: req.admin._id };
    
    if (!include_read) {
      query.read = false;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    // Handle expired notifications
    query.$or = [
      { expires_at: { $exists: false } },
      { expires_at: { $gt: new Date() } }
    ];

    // Parse sort parameter
    let sortQuery = { created_at: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortQuery = { [field]: order === 'asc' ? 1 : -1 };
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort(sortQuery)
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ ...query, read: false })
    ]);

    res.json({
      success: true,
      data: notifications,
      meta: {
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: total > parseInt(offset) + notifications.length
        },
        unread_count: unreadCount,
        total_count: total
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /admin/notifications/stats - Get notification statistics
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $match: {
          user_id: req.admin._id,  // FIXED: Changed from req.user.id
          $or: [
            { expires_at: { $exists: false } },
            { expires_at: { $gt: new Date() } }
          ]
        }
      },
      {
        $facet: {
          total_count: [{ $count: 'count' }],
          unread_count: [{ $match: { read: false } }, { $count: 'count' }],
          by_type: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          by_priority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          recent_notifications: [
            { $sort: { created_at: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: stats[0].total_count[0]?.count || 0,
        unread: stats[0].unread_count[0]?.count || 0,
        by_type: stats[0].by_type,
        by_priority: stats[0].by_priority,
        recent: stats[0].recent_notifications
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics'
    });
  }
});

// PATCH /admin/notifications/:id/read - Mark notification as read
router.patch('/:id/read', authenticateAdmin, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        user_id: req.admin._id,  // FIXED: Changed from req.user.id
        $or: [
          { expires_at: { $exists: false } },
          { expires_at: { $gt: new Date() } }
        ]
      },
      { 
        read: true,
        read_at: new Date(),
        updated_at: new Date()
      },
      { new: true }
    ).lean();

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or expired'
      });
    }

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// POST /admin/notifications/mark-all-read - Mark all notifications as read
router.post('/mark-all-read', authenticateAdmin, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { 
        user_id: req.admin._id,  // FIXED: Changed from req.user.id
        read: false,
        $or: [
          { expires_at: { $exists: false } },
          { expires_at: { $gt: new Date() } }
        ]
      },
      { 
        read: true,
        read_at: new Date(),
        updated_at: new Date()
      }
    );

    res.json({
      success: true,
      data: {
        modified_count: result.modifiedCount
      },
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// DELETE /admin/notifications/:id - Delete notification
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.admin._id  // FIXED: Changed from req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// POST /admin/notifications - Create a notification (for testing or admin use)
router.post('/', authenticateAdmin, authorize(['super_admin', 'admin']), async (req, res) => {
  try {
    const { 
      title, 
      message, 
      type = 'info', 
      priority = 'medium',
      data = {},
      user_id,
      expires_at 
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Validate type
    const validTypes = ['order', 'payment', 'user', 'system', 'warning', 'success', 'info'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type'
      });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority level'
      });
    }

    // Create notification
    const notification = new Notification({
      user_id: user_id || req.admin._id,  // FIXED: Changed from req.user.id
      title,
      message,
      type,
      priority,
      data,
      expires_at: expires_at ? new Date(expires_at) : undefined
    });

    await notification.save();

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

// DELETE /admin/notifications - Clear all notifications
router.delete('/', authenticateAdmin, async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      user_id: req.admin._id  // FIXED: Changed from req.user.id
    });

    res.json({
      success: true,
      data: {
        deleted_count: result.deletedCount
      },
      message: `Deleted ${result.deletedCount} notifications`
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications'
    });
  }
});

export default router;