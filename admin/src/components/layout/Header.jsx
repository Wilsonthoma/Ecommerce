import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BellIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
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
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  const NOTIFICATIONS_POLLING_INTERVAL = 30000;

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

  const fetchNotifications = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingNotifications(true);
      
      const response = await api.get('/admin/notifications', {
        params: { limit: 20, include_read: false, sort: 'created_at:desc' }
      });

      if (response.data?.success) {
        setNotifications(response.data.data || []);
        const unread = (response.data.data || []).filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (showLoading) setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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
      setNotifications(prev => 
        prev.map(notif => notif.id === notificationId ? { ...notif, read: true } : notif)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.post('/admin/notifications/mark-all-read');
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/admin/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
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
      case 'order': return <CheckCircleIcon className="w-5 h-5" />;
      case 'payment': return <SparklesIcon className="w-5 h-5" />;
      case 'user': return <UserIcon className="w-5 h-5" />;
      case 'system': return <Cog6ToothIcon className="w-5 h-5" />;
      case 'warning': return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'success': return <CheckCircleIcon className="w-5 h-5" />;
      case 'info': return <InformationCircleIcon className="w-5 h-5" />;
      default: return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return 'bg-green-500/20 text-green-400';
      case 'payment': return 'bg-purple-500/20 text-purple-400';
      case 'user': return 'bg-blue-500/20 text-blue-400';
      case 'system': return 'bg-gray-500/20 text-gray-400';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400';
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'info': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      const diffInHours = (new Date() - date) / (1000 * 60 * 60);
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
    if (!notification.read) markNotificationAsRead(notification.id);
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        {/* Search bar */}
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className={`w-5 h-5 transition-colors duration-200 ${searchFocused ? 'text-yellow-500' : 'text-gray-500'}`} />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`block w-full pl-10 pr-3 py-2.5 bg-gray-700 border rounded-lg leading-5 text-white placeholder-gray-500 transition-all duration-200 sm:text-sm ${
                searchFocused 
                  ? 'border-yellow-500 ring-2 ring-yellow-500/20' 
                  : 'border-gray-600 hover:border-gray-500'
              } focus:outline-none`}
              placeholder="Search products, orders, customers..."
              aria-label="Search"
            />
          </form>
        </div>

        {/* Right side icons */}
        <div className="flex items-center ml-4 space-x-2">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative p-2 text-gray-400 transition-all duration-200 rounded-lg hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label="Notifications"
            >
              <BellIcon className={`h-6 w-6 ${loadingNotifications ? 'animate-pulse' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 ring-2 ring-gray-800 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-50 mt-2 overflow-hidden bg-gray-800 border border-gray-700 shadow-2xl w-96 rounded-xl animate-slideDown">
                <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-800/50">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold text-white">
                      <BellIcon className="w-5 h-5 text-yellow-500" />
                      Notifications
                    </h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-xs font-medium text-yellow-500 transition-colors hover:text-yellow-400"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/admin/notifications')}
                        className="text-xs font-medium text-gray-400 transition-colors hover:text-white"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-96 custom-scrollbar">
                  {loadingNotifications ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 mx-auto border-2 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
                      <p className="mt-3 text-sm text-gray-400">Loading notifications...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="divide-y divide-gray-700">
                      {notifications.map((notification, index) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-700 cursor-pointer transition-all duration-200 group ${
                            !notification.read ? 'bg-yellow-600/5' : ''
                          } animate-fadeIn`}
                          style={{ animationDelay: `${index * 50}ms` }}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white">
                                {notification.title}
                              </p>
                              <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center text-xs text-gray-500">
                                  <ClockIcon className="w-3 h-3 mr-1" />
                                  {formatTime(notification.created_at)}
                                </div>
                                {!notification.read && (
                                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => deleteNotification(notification.id, e)}
                              className="p-1 text-gray-500 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:text-red-400"
                              aria-label="Delete notification"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-sm text-gray-400">No notifications</p>
                      <p className="mt-1 text-xs text-gray-500">You're all caught up!</p>
                    </div>
                  )}
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
              className="flex items-center gap-3 p-1 transition-all duration-200 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 group"
              aria-label="User menu"
            >
              <div className="relative">
                <div className="flex items-center justify-center text-white transition-transform duration-200 rounded-full shadow-lg w-9 h-9 bg-gradient-to-r from-yellow-500 to-orange-500 group-hover:scale-105">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="object-cover w-full h-full rounded-full" />
                  ) : (
                    <span className="text-sm font-semibold">{getUserInitials(user?.name)}</span>
                  )}
                </div>
                {user?.isAccountVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <div className="w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold text-white truncate max-w-[150px] group-hover:text-yellow-500 transition-colors">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user?.role?.replace('_', ' ') || 'Super Admin'}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 z-50 w-64 mt-2 overflow-hidden bg-gray-800 border border-gray-700 shadow-2xl rounded-xl animate-slideDown">
                <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="object-cover w-full h-full rounded-full" />
                      ) : (
                        <span>{getUserInitials(user?.name)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user?.name || 'Administrator'}</p>
                      <p className="text-xs text-gray-400">{user?.email || 'admin@example.com'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <p className="text-xs text-green-400 capitalize">
                          {user?.role?.replace('_', ' ') || 'Super Admin'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      navigate('/admin/profile');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-300 transition-all duration-200 rounded-lg hover:text-white hover:bg-gray-700 group"
                  >
                    <UserIcon className="w-5 h-5 mr-3 text-gray-500 transition-colors group-hover:text-yellow-500" />
                    Your Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin/settings');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-2 mt-1 text-sm text-gray-300 transition-all duration-200 rounded-lg hover:text-white hover:bg-gray-700 group"
                  >
                    <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-500 transition-colors group-hover:text-yellow-500" />
                    Settings
                  </button>
                </div>
                <div className="p-2 mt-2 border-t border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-400 transition-all duration-200 rounded-lg hover:text-red-300 hover:bg-red-900/20 group"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 transition-colors group-hover:text-red-300" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;