// src/components/Footer.jsx - CENTERED LOGO with yellow-orange theme matching navbar
import React from "react";
import { assets } from "../assets/assets";

// Font styles matching navbar
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .glow-text {
    text-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
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
    <footer className="border-t border-gray-800 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Background effect matching navbar */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-600/10 via-orange-600/10 to-transparent pointer-events-none"></div>
      
      <div className="relative px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* Centered Logo with decorative lines - Yellow-Orange theme */}
        <div className="flex items-center justify-center mb-3">
          {/* Left line - Yellow-Orange gradient */}
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-yellow-500 to-orange-500 sm:w-20 md:w-24"></div>
          
          {/* Logo */}
          <img 
            src={assets.logo} 
            alt="KwetuShop" 
            className="w-auto h-8 px-2 sm:h-9 sm:px-3"
          />
          
          {/* Right line - Yellow-Orange gradient */}
          <div className="w-12 h-px bg-gradient-to-l from-transparent via-yellow-500 to-orange-500 sm:w-20 md:w-24"></div>
        </div>

        {/* Quick Links - Same links as original */}
        <div className="flex flex-wrap items-center justify-center mb-3 text-xs text-gray-400 gap-x-2 gap-y-1">
          <a href="/about" className="transition-colors hover:text-yellow-500 hover:glow-text">About</a>
          <span className="text-gray-700">•</span>
          <a href="/blog" className="transition-colors hover:text-yellow-500 hover:glow-text">Blog</a>
          <span className="text-gray-700">•</span>
          <a href="/address-book" className="transition-colors hover:text-yellow-500 hover:glow-text">Address Book</a>
          <span className="text-gray-700">•</span>
          <a href="/contact" className="transition-colors hover:text-yellow-500 hover:glow-text">Contact</a>
          <span className="text-gray-700">•</span>
          <a href="/privacy" className="transition-colors hover:text-yellow-500 hover:glow-text">Privacy</a>
          <span className="text-gray-700">•</span>
          <a href="/terms" className="transition-colors hover:text-yellow-500 hover:glow-text">Terms</a>
          <span className="text-gray-700">•</span>
          <a href="/returns" className="transition-colors hover:text-yellow-500 hover:glow-text">Returns</a>
          <span className="text-gray-700">•</span>
          <a href="/shipping" className="transition-colors hover:text-yellow-500 hover:glow-text">Shipping</a>
          <span className="text-gray-700">•</span>
          <a href="/faq" className="transition-colors hover:text-yellow-500 hover:glow-text">FAQ</a>
          <span className="text-gray-700">•</span>
          <a href="/help" className="transition-colors hover:text-yellow-500 hover:glow-text">Help</a>
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