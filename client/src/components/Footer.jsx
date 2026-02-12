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

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
                  <FiMapPin className="flex-shrink-0 w-4 h-4 text-cyan-400" />
                  <span>Nairobi, Kenya</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <FiPhone className="flex-shrink-0 w-4 h-4 text-cyan-400" />
                  <a href="tel:0700KWEƬU" className="hover:text-cyan-400">0700 KWEƬU</a>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <FiMail className="flex-shrink-0 w-4 h-4 text-cyan-400" />
                  <a href="mailto:support@kwetushop.ke" className="hover:text-cyan-400">support@kwetushop.ke</a>
                </li>
              </ul>
            </div>

            {/* Quick Links - Essential */}
            <div>
              <h4 className="pb-2 mb-4 text-lg font-semibold text-white border-b border-gray-800">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/track-order" className="text-sm text-gray-400 transition-colors hover:text-cyan-400">
                    Track Order
                  </a>
                </li>
                <li>
                  <a href="/sell" className="text-sm text-gray-400 transition-colors hover:text-cyan-400">
                    Sell on KwetuShop
                  </a>
                </li>
                <li>
                  <a href="/help" className="text-sm text-gray-400 transition-colors hover:text-cyan-400">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-sm text-gray-400 transition-colors hover:text-cyan-400">
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow Us - Essential */}
            <div>
              <h4 className="pb-2 mb-4 text-lg font-semibold text-white border-b border-gray-800">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="p-2 transition-colors bg-gray-800 rounded-lg hover:bg-blue-600">
                  <FiFacebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 transition-colors bg-gray-800 rounded-lg hover:bg-pink-600">
                  <FiInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 transition-colors bg-gray-800 rounded-lg hover:bg-blue-400">
                  <FiTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 transition-colors bg-gray-800 rounded-lg hover:bg-red-600">
                  <FiYoutube className="w-5 h-5" />
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
                <a href="/terms" className="transition-colors hover:text-cyan-400">Terms</a>
                <a href="/privacy" className="transition-colors hover:text-cyan-400">Privacy</a>
                <a href="/cookies" className="transition-colors hover:text-cyan-400">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;