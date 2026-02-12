import React, { useState } from 'react';
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
  Bars3Icon, // Added this import
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: ShoppingBagIcon },
  { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Close mobile sidebar when clicking a link
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          ${collapsed ? 'md:w-20' : 'md:w-64'}
          fixed inset-y-0 left-0 z-50 
          transition-all duration-300 ease-in-out 
          md:relative md:flex md:flex-shrink-0
        `}
      >
        <div className="flex flex-col bg-white border-r border-gray-200 h-full w-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              {!collapsed && (
                <h1 className="ml-3 text-xl font-bold text-gray-900 truncate">
                  KwetuShop
                </h1>
              )}
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
                onClick={handleNavClick}
              >
                <item.icon 
                  className={`h-5 w-5 flex-shrink-0 ${
                    collapsed ? 'mx-auto' : 'mr-3'
                  }`}
                />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role || 'Administrator'}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
      >
        <Bars3Icon className="h-5 w-5 text-gray-500" />
      </button>

      {/* Desktop collapse button */}
      <button
        onClick={toggleSidebar}
        className="hidden md:fixed md:block top-4 z-40 p-1 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 transition-all duration-300"
        style={{ 
          left: collapsed ? '5rem' : '16rem',
          transform: 'translateX(-100%)'
        }}
      >
        {collapsed ? (
          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
    </>
  );
};

export default Sidebar;