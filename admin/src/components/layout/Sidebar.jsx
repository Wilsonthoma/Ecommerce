import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  TagIcon
} from '@heroicons/react/24/outline';
// Remove TrendingUpIcon and SparklesIcon if they don't exist
// SparklesIcon exists in Heroicons, TrendingUpIcon might be ChartBarIcon
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, badge: null },
  { name: 'Products', href: '/products', icon: ShoppingBagIcon, badge: null },
  { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon, badge: null },
  { name: 'Users', href: '/users', icon: UsersIcon, badge: null },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, badge: 'New' },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, badge: null },
];

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300 bg-black/60 backdrop-blur-sm md:hidden animate-fadeIn"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 
          transition-all duration-300 ease-out transform
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${collapsed ? 'md:w-20' : 'md:w-64'}
          w-64
        `}
      >
        <div className="flex flex-col h-full border-r border-gray-700 shadow-2xl bg-gray-800/95 backdrop-blur-sm">
          {/* Logo and close button */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 animate-gradient">
                  <span className="text-lg font-bold text-white">K</span>
                </div>
                <div className="absolute inset-0 rounded-lg opacity-50 bg-gradient-to-r from-yellow-500 to-orange-500 blur-md animate-pulse"></div>
              </div>
              {(!collapsed || isMobile) && (
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text">
                    KwetuShop
                  </h1>
                  <p className="text-[10px] text-gray-500 -mt-1">Admin Panel</p>
                </div>
              )}
            </div>
            {/* Close button - only visible on mobile when sidebar is open */}
            {isMobile && isMobileOpen && (
              <button
                onClick={closeMobileSidebar}
                className="p-1 text-gray-400 transition-all duration-200 rounded-lg hover:text-white hover:bg-gray-700 md:hidden"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
            {/* Collapse button - only visible on desktop */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="hidden p-1 text-gray-400 transition-all duration-200 rounded-lg md:block hover:text-yellow-500 hover:bg-gray-700"
              >
                {collapsed ? (
                  <ChevronRightIcon className="w-5 h-5" />
                ) : (
                  <ChevronLeftIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={({ isActive }) =>
                  `relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  } ${(collapsed && !isMobile) ? 'justify-center' : ''}`
                }
              >
                <div className={`relative ${(collapsed && !isMobile) ? '' : 'mr-3'}`}>
                  <item.icon 
                    className={`h-5 w-5 transition-all duration-200 ${
                      hoveredItem === item.name ? 'scale-110' : ''
                    }`}
                  />
                  {item.badge && !collapsed && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.5 text-[8px] font-bold text-white rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                {(!collapsed || isMobile) && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[8px] font-bold text-white rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && !isMobile && item.badge && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="flex-shrink-0 p-4 border-t border-gray-700/50">
            <div className={`flex items-center ${(!collapsed || isMobile) ? '' : 'justify-center'} mb-4`}>
              <div className="relative flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 animate-gradient">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
              </div>
              {(!collapsed || isMobile) && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <SparklesIcon className="w-3 h-3" />
                    <span className="capitalize">{user?.role || 'Administrator'}</span>
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 transition-all duration-200 rounded-lg hover:text-red-300 hover:bg-red-900/20 group ${
                (collapsed && !isMobile) ? 'justify-center' : ''
              }`}
            >
              <ArrowRightOnRectangleIcon className="flex-shrink-0 w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              {(!collapsed || isMobile) && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed z-40 p-2 transition-all duration-200 bg-gray-800 border border-gray-700 rounded-lg shadow-lg top-4 left-4 hover:bg-gray-700 hover:scale-105 active:scale-95"
        >
          <Bars3Icon className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Overlay content padding when sidebar is open on mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-30 pointer-events-none" />
      )}
    </>
  );
};

export default Sidebar;