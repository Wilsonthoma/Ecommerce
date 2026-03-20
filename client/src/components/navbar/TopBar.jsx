// src/components/navbar/TopBar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiPhone, FiHelpCircle } from 'react-icons/fi';
import { BsLightningCharge } from 'react-icons/bs';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const TopBar = ({ onNavigate }) => {
  const navigate = useNavigate();

  return (
    <div className="relative border-b border-gray-800 bg-gradient-to-r from-gray-900 via-black to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-600/10 via-orange-600/10 to-red-600/10"></div>
      <div className="relative px-3 mx-auto max-w-7xl sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-9 sm:h-10 text-[11px] sm:text-xs">
          {/* LEFT SIDE - Quick Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => onNavigate('/track-order')}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-all group"
            >
              <FiTruck className="w-3.5 h-3.5 group-hover:text-yellow-500 transition-colors" />
              <span className="hidden xs:inline group-hover:glow-text">Track Order</span>
              <span className="xs:hidden">Track</span>
            </button>
            
            <button 
              onClick={() => onNavigate('/deals')}
              className="hidden sm:flex items-center gap-1.5 text-gray-400 hover:text-white transition-all group"
            >
              <BsLightningCharge className="w-3.5 h-3.5 group-hover:text-yellow-500 transition-colors" />
              <span className="group-hover:glow-text">Hot Deals</span>
            </button>

            <button 
              onClick={() => onNavigate('/help')}
              className="hidden md:flex items-center gap-1.5 text-gray-400 hover:text-white transition-all group"
            >
              <FiHelpCircle className="w-3.5 h-3.5 group-hover:text-yellow-500 transition-colors" />
              <span className="group-hover:glow-text">Help Center</span>
            </button>
          </div>

          {/* RIGHT SIDE - Contact & Social */}
          <div className="flex items-center gap-3 sm:gap-5">
            <a 
              href="tel:0700KWEƬU" 
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-all group"
            >
              <FiPhone className="w-3.5 h-3.5 group-hover:text-yellow-500 transition-colors" />
              <span className="hidden sm:inline group-hover:glow-text">0700 KWEƬU</span>
              <span className="sm:hidden">Support</span>
            </a>
            
            {/* Social Links */}
            <div className="items-center hidden gap-3 lg:flex">
              {[
                { icon: FaFacebookF, href: '#' },
                { icon: FaTwitter, href: '#' },
                { icon: FaInstagram, href: '#' },
                { icon: FaYoutube, href: '#' }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  className="text-gray-400 hover:text-white transition-all p-1.5 rounded-full hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-orange-600/20 hover:border-yellow-500/50 border border-transparent"
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;