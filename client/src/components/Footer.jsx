// src/components/Footer.jsx - CENTERED LOGO with optimized links and reduced spacing
import React from "react";
import { assets } from "../assets/assets";

// Font styles
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Inject styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* Centered Logo with decorative lines */}
        <div className="flex items-center justify-center mb-3">
          {/* Left line */}
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-yellow-600 to-yellow-500 sm:w-20 md:w-24"></div>
          
          {/* Logo */}
          <img 
            src={assets.logo} 
            alt="KwetuShop" 
            className="w-auto h-8 px-2 sm:h-9 sm:px-3"
          />
          
          {/* Right line */}
          <div className="w-12 h-px bg-gradient-to-l from-transparent via-yellow-600 to-yellow-500 sm:w-20 md:w-24"></div>
        </div>

        {/* Quick Links - Consolidated and spaced closer */}
        <div className="flex flex-wrap items-center justify-center mb-3 text-xs text-gray-400 gap-x-2 gap-y-1">
          <a href="/about" className="transition-colors hover:text-yellow-500">About</a>
          <span className="text-gray-700">•</span>
          <a href="/blog" className="transition-colors hover:text-yellow-500">Blog</a>
          <span className="text-gray-700">•</span>
          <a href="/address-book" className="transition-colors hover:text-yellow-500">Address Book</a>
          <span className="text-gray-700">•</span>
          <a href="/contact" className="transition-colors hover:text-yellow-500">Contact</a>
          <span className="text-gray-700">•</span>
          <a href="/privacy" className="transition-colors hover:text-yellow-500">Privacy</a>
          <span className="text-gray-700">•</span>
          <a href="/terms" className="transition-colors hover:text-yellow-500">Terms</a>
          <span className="text-gray-700">•</span>
          <a href="/returns" className="transition-colors hover:text-yellow-500">Returns</a>
          <span className="text-gray-700">•</span>
          <a href="/shipping" className="transition-colors hover:text-yellow-500">Shipping</a>
          <span className="text-gray-700">•</span>
          <a href="/faq" className="transition-colors hover:text-yellow-500">FAQ</a>
          <span className="text-gray-700">•</span>
          <a href="/help" className="transition-colors hover:text-yellow-500">Help</a>
        </div>

        {/* Bottom Bar - Copyright only */}
        <div className="pt-3 mt-1 text-center border-t border-gray-800">
          <div className="text-xs text-gray-400">
            Copyright © {currentYear} KwetuShop. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;