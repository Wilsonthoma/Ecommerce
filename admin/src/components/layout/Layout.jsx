import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // Update page title based on route
  useEffect(() => {
    const path = location.pathname;
    const titleMap = {
      '/dashboard': 'Dashboard',
      '/products': 'Products',
      '/orders': 'Orders',
      '/users': 'Users',
      '/analytics': 'Analytics',
      '/settings': 'Settings',
      '/profile': 'Profile',
    };
    setPageTitle(titleMap[path] || 'KwetuShop Admin');
    document.title = `${titleMap[path] || 'KwetuShop'} | Admin Panel`;
  }, [location]);

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Sidebar with animation */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex-shrink-0"
      >
        <Sidebar />
      </motion.div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header with animation */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
        >
          <Header />
        </motion.div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/50">
          <div className="container px-4 py-6 mx-auto md:px-6 md:py-8 lg:px-8">
            {/* Page Header with Breadcrumb */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-transparent text-white md:text-3xl bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text">
                    {pageTitle}
                  </h1>
                  <p className="mt-1 text-sm text-gray-400">
                    Welcome back! Here's what's happening with your store today.
                  </p>
                </div>
                
                {/* Quick Stats Badge */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-400">System Online</span>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
                    <span className="text-xs text-gray-400">
                      Last updated: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 mt-4 text-sm">
                <span className="text-gray-500">Admin</span>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-yellow-500">{pageTitle}</span>
              </div>
            </div>

            {/* Page Content with Transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="min-h-[calc(100vh-200px)]"
              >
                {isLoading ? (
                  // Loading Skeleton
                  <div className="space-y-4">
                    <div className="p-6 border border-gray-700 bg-gray-800/50 backdrop-blur-sm rounded-xl animate-pulse">
                      <div className="w-1/4 h-8 mb-4 bg-gray-700 rounded"></div>
                      <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 border border-gray-700 bg-gray-800/50 backdrop-blur-sm rounded-xl animate-pulse">
                          <div className="w-12 h-12 mb-4 bg-gray-700 rounded-full"></div>
                          <div className="w-3/4 h-6 mb-2 bg-gray-700 rounded"></div>
                          <div className="w-1/2 h-4 bg-gray-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Outlet />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <footer className="pt-8 mt-8 border-t border-gray-800">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-500">
                  © {new Date().getFullYear()} KwetuShop. All rights reserved.
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    System Operational
                  </span>
                  <span>v2.0.0</span>
                  <span>Powered by KwetuShop</span>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;