// src/components/navbar/MobileMenu.jsx
import React, { useRef, useEffect } from 'react';
import { FiX, FiSearch, FiUser, FiHome, FiPackage, FiHeart, FiTruck, FiHelpCircle, FiMail, FiPhone, FiLogOut, FiLogIn } from 'react-icons/fi';
import { BsLightningCharge } from 'react-icons/bs';

const MobileMenu = ({
  isOpen,
  onClose,
  isLoggedIn,
  user,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onKeyDown,
  onNavigate,
  onLogout,
  currentYear,
  avatarError,
  getFullImageUrl
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest("[data-menu-toggle]")) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md" onClick={onClose} />
      <div
        ref={menuRef}
        className="absolute top-0 right-0 bg-gradient-to-b from-gray-900 to-black shadow-2xl rounded-l-2xl border-l border-gray-800 w-64 max-w-[80vw] max-h-[75vh] flex flex-col"
        style={{ top: '12.5vh' }}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-l-2xl opacity-20 blur-xl"></div>
        
        {/* Header */}
        <div className="relative flex-shrink-0 p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-tl-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {isLoggedIn && user?.avatar && !avatarError ? (
                  <img
                    src={getFullImageUrl(user.avatar)}
                    alt={user.name}
                    className="object-cover w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 text-sm rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                    {isLoggedIn ? (
                      <span className="font-bold text-white">
                        {user?.name?.charAt(0) || <FiUser className="w-5 h-5" />}
                      </span>
                    ) : (
                      <FiUser className="w-5 h-5 text-white" />
                    )}
                  </div>
                )}
              </div>
              <div>
                {isLoggedIn ? (
                  <>
                    <p className="font-semibold text-white">{user?.name?.split(" ")[0] || "User"}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{user?.email}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-white">Welcome!</p>
                    <p className="text-xs text-gray-400">Sign in for faster checkout</p>
                  </>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="relative flex-1 overflow-y-auto">
          {/* Mobile Search */}
          <div className="p-3 border-b border-gray-800">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={onSearchChange}
                onKeyDown={onKeyDown}
                className="w-full py-2 pr-3 text-sm text-gray-300 border border-gray-700 rounded-lg bg-gray-800/50 pl-9 focus:ring-2 focus:ring-yellow-500/50"
              />
              <FiSearch className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
            </div>
          </div>

          {/* Account Section */}
          {isLoggedIn && (
            <div className="p-3 border-b border-gray-800">
              <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-white">
                <FiUser className="w-4 h-4 text-yellow-500" />
                My Account
              </h3>
              <div className="space-y-1">
                <button onClick={() => { onNavigate('/dashboard'); onClose(); }} className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 rounded-lg hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/10 hover:to-orange-600/10 group">
                  <FiHome className="w-4 h-4 transition-colors group-hover:text-yellow-500" />
                  <span className="flex-1 text-left">Dashboard</span>
                </button>
                <button onClick={() => { onNavigate('/orders'); onClose(); }} className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 rounded-lg hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/10 hover:to-orange-600/10 group">
                  <FiPackage className="w-4 h-4 transition-colors group-hover:text-yellow-500" />
                  <span className="flex-1 text-left">My Orders</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="p-3 border-b border-gray-800">
            <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-white">
              <FiTruck className="w-4 h-4 text-yellow-500" />
              Quick Links
            </h3>
            <div className="space-y-1">
              <button onClick={() => { onNavigate('/track-order'); onClose(); }} className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 rounded-lg hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/10 hover:to-orange-600/10 group">
                <FiTruck className="w-4 h-4 transition-colors group-hover:text-yellow-500" />
                <span className="flex-1 text-left">Track Order</span>
              </button>
              <button onClick={() => { onNavigate('/deals'); onClose(); }} className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 rounded-lg hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/10 hover:to-orange-600/10 group">
                <BsLightningCharge className="w-4 h-4 transition-colors group-hover:text-yellow-500" />
                <span className="flex-1 text-left">Hot Deals</span>
              </button>
              <button onClick={() => { onNavigate('/help'); onClose(); }} className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 rounded-lg hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/10 hover:to-orange-600/10 group">
                <FiHelpCircle className="w-4 h-4 transition-colors group-hover:text-yellow-500" />
                <span className="flex-1 text-left">Help Center</span>
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="p-3">
            <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-white">
              <FiPhone className="w-4 h-4 text-yellow-500" />
              Support
            </h3>
            <div className="space-y-2">
              <a href="tel:0700KWEƬU" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 rounded-lg hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/10 hover:to-orange-600/10 group">
                <FiPhone className="w-4 h-4 transition-colors group-hover:text-yellow-500" />
                <span className="font-medium">0700 KWEƬU</span>
              </a>
              <a href="mailto:support@kwetushop.com" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 rounded-lg hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/10 hover:to-orange-600/10 group">
                <FiMail className="w-4 h-4 transition-colors group-hover:text-yellow-500" />
                <span className="truncate">support@kwetushop.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        {isLoggedIn && (
          <div className="relative flex-shrink-0 p-3 bg-gray-900 border-t border-gray-800">
            <button onClick={onLogout} className="flex items-center w-full gap-3 px-3 py-2 text-sm text-red-500 rounded-lg hover:text-red-400 hover:bg-red-500/10">
              <FiLogOut className="w-4 h-4" />
              <span className="flex-1 text-left">Logout</span>
            </button>
          </div>
        )}
        
        <div className="relative flex-shrink-0 p-3 text-xs text-center text-gray-500 bg-gray-900 border-t border-gray-800">
          © {currentYear} KwetuShop
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
