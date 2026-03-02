// src/components/Layout.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
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

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Check if current path is in NO_LAYOUT_PAGES
  const shouldHideLayout = NO_LAYOUT_PAGES.some(path => 
    location.pathname.startsWith(path)
  );

  // For auth pages - render ONLY the page content (no Navbar/Footer)
  if (shouldHideLayout) {
    return <>{children}</>;
  }

  // For all other pages - render full layout with Navbar and Footer
  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;