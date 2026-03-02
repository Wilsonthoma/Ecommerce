// src/components/Layout.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import Footer from './Footer';

// Pages where Navbar and Footer should NOT appear
// Login serves for both login and register
const NO_LAYOUT_PAGES = [
  '/login',
  '/reset-password',
  '/email-verify',
  '/verify-email',
  '/forgot-password'
];

// Custom toast styling to match your yellow-orange theme
const toastTheme = {
  success: {
    background: 'linear-gradient(135deg, #10B981, #059669)',
    icon: '✅',
  },
  error: {
    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
    icon: '❌',
  },
  warning: {
    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    icon: '⚠️',
  },
  info: {
    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    icon: 'ℹ️',
  },
};

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Check if current path is in NO_LAYOUT_PAGES
  const shouldHideLayout = NO_LAYOUT_PAGES.some(path => 
    location.pathname.startsWith(path)
  );

  // For auth pages - render ONLY the page content (no Navbar/Footer)
  if (shouldHideLayout) {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{
            backgroundColor: '#1F2937',
            color: '#fff',
            border: '1px solid #374151',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          }}
          progressStyle={{
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
          }}
        />
        {children}
      </>
    );
  }

  // For all other pages - render full layout with Navbar and Footer
  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: '#1F2937',
          color: '#fff',
          border: '1px solid #374151',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
        }}
        progressStyle={{
          background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
        }}
      />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;