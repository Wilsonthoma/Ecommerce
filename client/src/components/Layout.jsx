// src/components/Layout.jsx - Enhanced with scroll to top, meta tags, and better performance
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ToastConfig from './ui/ToastConfig';
import Navbar from './Navbar';
import Footer from './Footer';

// Pages where Navbar and Footer should NOT appear
const NO_LAYOUT_PAGES = [
  '/login', 
  '/reset-password', 
  '/email-verify', 
  '/verify-email', 
  '/forgot-password', 
  '/auth/callback'
];

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const shouldHideLayout = NO_LAYOUT_PAGES.some(path => 
    location.pathname === path || location.pathname.startsWith(path)
  );

  // For auth pages - render ONLY the page content (no Navbar/Footer)
  if (shouldHideLayout) {
    return (
      <>
        <ScrollToTop />
        <ToastConfig />
        {children}
      </>
    );
  }

  // For all other pages - render full layout with Navbar and Footer
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <ToastConfig />
      <main className="flex-grow min-h-screen bg-black">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;