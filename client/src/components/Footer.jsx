// src/components/Footer.jsx - UPDATED with indigo/blue/cyan theme
import React from "react";
import { 
  FiMapPin,
  FiPhone,
  FiMail,
  FiFacebook, 
  FiInstagram, 
  FiTwitter, 
  FiYoutube,
} from "react-icons/fi";

// Font styles matching homepage
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
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
    <footer className="text-white bg-gradient-to-b from-gray-900 to-black">
      {/* Main Footer Content - Simplified */}
      <div className="py-12">
        <div className="px-4 mx-auto max-w-7xl">
          {/* Essential Links Grid - 3 columns only */}
          <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-3">
            {/* Contact - Essential */}
            <div>
              <h4 className="pb-2 mb-4 text-lg font-semibold text-white border-b border-gray-800">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <FiMapPin className="flex-shrink-0 w-4 h-4 text-indigo-500" />
                  <span>Nairobi, Kenya</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <FiPhone className="flex-shrink-0 w-4 h-4 text-indigo-500" />
                  <a href="tel:0700KWEƬU" className="transition-colors hover:text-indigo-500">0700 KWEƬU</a>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <FiMail className="flex-shrink-0 w-4 h-4 text-indigo-500" />
                  <a href="mailto:support@kwetushop.ke" className="transition-colors hover:text-indigo-500">support@kwetushop.ke</a>
                </li>
              </ul>
            </div>

            {/* Quick Links - Essential */}
            <div>
              <h4 className="pb-2 mb-4 text-lg font-semibold text-white border-b border-gray-800">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/track-order" className="text-sm text-gray-400 transition-colors hover:text-indigo-500">
                    Track Order
                  </a>
                </li>
                <li>
                  <a href="/sell" className="text-sm text-gray-400 transition-colors hover:text-indigo-500">
                    Sell on KwetuShop
                  </a>
                </li>
                <li>
                  <a href="/help" className="text-sm text-gray-400 transition-colors hover:text-indigo-500">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-sm text-gray-400 transition-colors hover:text-indigo-500">
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow Us - Essential */}
            <div>
              <h4 className="pb-2 mb-4 text-lg font-semibold text-white border-b border-gray-800">Follow Us</h4>
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="p-2 transition-all bg-gray-800 rounded-lg hover:bg-indigo-600 hover:scale-110"
                  aria-label="Facebook"
                >
                  <FiFacebook className="w-5 h-5 text-white" />
                </a>
                <a 
                  href="#" 
                  className="p-2 transition-all bg-gray-800 rounded-lg hover:bg-indigo-600 hover:scale-110"
                  aria-label="Instagram"
                >
                  <FiInstagram className="w-5 h-5 text-white" />
                </a>
                <a 
                  href="#" 
                  className="p-2 transition-all bg-gray-800 rounded-lg hover:bg-indigo-600 hover:scale-110"
                  aria-label="Twitter"
                >
                  <FiTwitter className="w-5 h-5 text-white" />
                </a>
                <a 
                  href="#" 
                  className="p-2 transition-all bg-gray-800 rounded-lg hover:bg-indigo-600 hover:scale-110"
                  aria-label="YouTube"
                >
                  <FiYoutube className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright - Essential Only */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-center text-gray-400 md:text-left">
                &copy; {currentYear} KwetuShop Kenya. All rights reserved.
              </div>
              <div className="flex gap-6 text-xs text-gray-400">
                <a href="/terms" className="transition-colors hover:text-indigo-500">Terms</a>
                <a href="/privacy" className="transition-colors hover:text-indigo-500">Privacy</a>
                <a href="/cookies" className="transition-colors hover:text-indigo-500">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;