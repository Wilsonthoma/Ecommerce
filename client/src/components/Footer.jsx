// src/components/Footer.jsx - CENTERED LOGO with decorative lines
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
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* Centered Logo with decorative lines */}
        <div className="flex items-center justify-center mb-8">
          {/* Left line */}
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-yellow-600 to-yellow-500 sm:w-24 md:w-32"></div>
          
          {/* Logo */}
          <img 
            src={assets.logo} 
            alt="KwetuShop" 
            className="w-auto h-8 px-3 sm:h-10 sm:px-4"
          />
          
          {/* Right line */}
          <div className="w-12 h-px bg-gradient-to-l from-transparent via-yellow-600 to-yellow-500 sm:w-24 md:w-32"></div>
        </div>

        {/* Media Contact - Centered */}
        <div className="mb-8 text-center">
          <div className="text-sm text-gray-400">
            Media Contact: <a href="mailto:support@kwetushop.ke" className="text-gray-300 transition-colors hover:text-yellow-500">hello.ab@kwetushop.ke</a>
          </div>
        </div>

        {/* Bottom Bar - Centered */}
        <div className="pt-6 mt-4 text-center border-t border-gray-800">
          {/* Legal Links - Centered */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3 text-xs text-gray-400">
            <a href="/privacy" className="transition-colors hover:text-white">Privacy Policy</a>
            <span className="text-gray-700">•</span>
            <a href="/terms" className="transition-colors hover:text-white">Terms of Use</a>
          </div>

          {/* Copyright - Centered */}
          <div className="text-xs text-gray-400">
            Copyright © {currentYear} KwetuShop Corporation. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;