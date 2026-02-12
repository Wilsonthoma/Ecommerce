import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BellIcon, 
  MagnifyingGlassIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';  // CHANGED: Default import instead of named import
import { formatDistanceToNow, format } from 'date-fns';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Polling interval for new notifications (every 30 seconds)
  const NOTIFICATIONS_POLLING_INTERVAL = 30000;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingNotifications(true);
      
      const response = await api.get('/admin/notifications', {
        params: {
          limit: 20,
          include_read: false,
          sort: 'created_at:desc'
        }
      });

      if (response.data?.success) {
        setNotifications(response.data.data || []);
        
        // Calculate unread count
        const unread = (response.data.data || []).filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to empty array if API fails
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (showLoading) setLoadingNotifications(false);
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    fetchNotifications();

    // Set up polling for new notifications
    const intervalId = setInterval(fetchNotifications, NOTIFICATIONS_POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.patch(`/admin/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true, read_at: new Date().toISOString() } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.post('/admin/notifications/mark-all-read');
      
      // Update all notifications to read
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    
    try {
      await api.delete(`/admin/notifications/${notificationId}`);
      
      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // Update unread count if notification was unread
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'payment':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'user':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'system':
        return <Cog6ToothIcon className="h-5 w-5" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-5 w-5" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5" />;
      default:
        return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return 'text-green-600 bg-green-100';
      case 'payment': return 'text-purple-600 bg-purple-100';
      case 'user': return 'text-blue-600 bg-blue-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'success': return 'text-green-600 bg-green-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (error) {
      return 'Recent';
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read first
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
        if (notification.data?.order_id) {
          navigate(`/admin/orders/${notification.data.order_id}`);
        } else {
          navigate('/admin/orders');
        }
        break;
      case 'payment':
        if (notification.data?.payment_id) {
          navigate(`/admin/payments/${notification.data.payment_id}`);
        } else {
          navigate('/admin/payments');
        }
        break;
      case 'user':
        if (notification.data?.user_id) {
          navigate(`/admin/users/${notification.data.user_id}`);
        } else {
          navigate('/admin/users');
        }
        break;
      default:
        // For other types, just close the dropdown
        break;
    }
    
    setShowNotifications(false);
  };

  // Added missing user dropdown menu content
  const renderUserMenu = () => (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="h-full w-full rounded-full object-cover border-2 border-white" 
            />
          ) : (
            <span>{getUserInitials(user?.name)}</span>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-semibold text-gray-900">{user?.name || 'Administrator'}</p>
          <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
          <p className="text-xs text-primary-600 capitalize mt-1 font-medium">
            {user?.role?.replace('_', ' ') || 'Super Admin'}
          </p>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <a
          href="/admin/profile"
          className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
          onClick={(e) => {
            e.preventDefault();
            navigate('/admin/profile');
            setShowUserMenu(false);
          }}
        >
          <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
          Your Profile
        </a>
        <a
          href="/admin/settings"
          className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150 mt-1"
          onClick={(e) => {
            e.preventDefault();
            navigate('/admin/settings');
            setShowUserMenu(false);
          }}
        >
          <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-400" />
          Settings
        </a>
      </div>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4">
        {/* Search bar */}
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
              placeholder="Search products, orders, customers..."
              aria-label="Search"
            />
          </form>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-3 ml-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
                if (!showNotifications) {
                  fetchNotifications();
                }
              }}
              className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              aria-label="Notifications"
              disabled={loadingNotifications}
            >
              <BellIcon className={`h-6 w-6 ${loadingNotifications ? 'animate-pulse' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transform origin-top-right">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                          disabled={loadingNotifications}
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/admin/notifications')}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-3 text-sm text-gray-500">Loading notifications...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 group ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center text-xs text-gray-500">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  {formatTime(notification.created_at)}
                                </div>
                                {!notification.read && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                                    New
                                  </span>
                                )}
                              </div>
                              
                              {/* Additional data if available */}
                              {notification.data && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                  {notification.data.order_id && (
                                    <div>Order: #{notification.data.order_id}</div>
                                  )}
                                  {notification.data.amount && (
                                    <div>Amount: ${parseFloat(notification.data.amount).toFixed(2)}</div>
                                  )}
                                  {notification.data.customer_name && (
                                    <div>Customer: {notification.data.customer_name}</div>
                                  )}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => deleteNotification(notification.id, e)}
                              className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-600 transition-opacity duration-150"
                              aria-label="Delete notification"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No notifications</p>
                      <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-500 text-center">
                    Notifications update every 30 seconds
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-sm">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-full w-full rounded-full object-cover border-2 border-white" 
                  />
                ) : (
                  <span className="text-sm">{getUserInitials(user?.name)}</span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ') || 'Super Admin'}
                </p>
              </div>
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 transform origin-top-right">
                {renderUserMenu()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;