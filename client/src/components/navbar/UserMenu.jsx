// src/components/navbar/UserMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiChevronDown, FiHome, FiPackage, FiHeart, FiSettings, FiLogOut, FiLogIn, FiShield, FiCheckCircle } from 'react-icons/fi';
import { MdVerified, MdWarning } from 'react-icons/md';

const UserMenu = ({ 
  isLoggedIn, 
  user, 
  wishlistCount, 
  avatarError, 
  getFullImageUrl,
  onNavigate,
  onLogout,
  onVerify,
  verifyLoading
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userMenuItems = [
    { label: "Dashboard", path: "/dashboard", icon: <FiHome className="w-4 h-4" /> },
    { label: "My Orders", path: "/orders", icon: <FiPackage className="w-4 h-4" />, badge: 0 },
    { label: "Wishlist", path: "/wishlist", icon: <FiHeart className="w-4 h-4" />, badge: wishlistCount },
    { label: "Settings", path: "/settings", icon: <FiSettings className="w-4 h-4" /> },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-gray-400 rounded-full hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-orange-600/20 transition-all group"
      >
        <div className="relative">
          {isLoggedIn && user?.avatar && !avatarError ? (
            <img
              src={getFullImageUrl(user.avatar)}
              alt={user.name}
              className="object-cover w-5 h-5 rounded-full sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              onError={() => avatarError}
            />
          ) : (
            <FiUser className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          )}
          {isLoggedIn && user && !user.isAccountVerified && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 border-2 border-gray-900 rounded-full animate-pulse"></span>
          )}
        </div>
        <span className="hidden text-sm font-medium lg:inline group-hover:glow-text">
          {isLoggedIn ? (user?.name?.split(" ")[0] || "Account") : "Account"}
        </span>
        <FiChevronDown className={`hidden lg:block w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180 text-yellow-500" : ""}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 z-50 w-64 py-2 mt-2 border border-gray-800 shadow-2xl bg-gradient-to-br from-gray-900 to-black top-full rounded-2xl animate-fadeIn backdrop-blur-lg">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl opacity-20 blur-xl"></div>
          
          <div className="relative">
            {isLoggedIn ? (
              <>
                {/* Logged In User View */}
                <div className="px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {user?.avatar && !avatarError ? (
                        <img
                          src={getFullImageUrl(user.avatar)}
                          alt={user.name}
                          className="object-cover w-10 h-10 rounded-full"
                          onError={() => avatarError}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                          {user?.name?.charAt(0) || <FiUser className="w-5 h-5" />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      {user?.isAccountVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-500 mt-0.5">
                          <MdVerified className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-500 mt-0.5">
                          <MdWarning className="w-3 h-3" />
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Prompt */}
                {!user.isAccountVerified && (
                  <div className="p-3 mx-3 my-2 border rounded-xl bg-yellow-600/10 border-yellow-600/20">
                    <div className="flex items-start gap-2">
                      <FiShield className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-yellow-500">Verify your email</p>
                        <p className="text-xs text-gray-400 mt-0.5 mb-2">Unlock all features</p>
                        <button
                          onClick={() => {
                            onVerify();
                            setDropdownOpen(false);
                          }}
                          disabled={verifyLoading}
                          className="group relative w-full px-3 py-1.5 text-xs font-medium text-white transition-all rounded-full overflow-hidden"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                          <span className="relative">
                            {verifyLoading ? "Sending..." : "Verify Now"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Menu Items */}
                <div className="py-1">
                  {userMenuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        onNavigate(item.path);
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/10 hover:to-orange-600/10 transition-all group"
                    >
                      <span className="text-gray-500 transition-colors group-hover:text-yellow-500">{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="px-1.5 py-0.5 text-xs font-medium text-white bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                          {item.badge}
                        </span>
                      )}
                      <FiChevronRight className="w-4 h-4 text-gray-600 transition-colors group-hover:text-yellow-500" />
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div className="pt-1 mt-1 border-t border-gray-800">
                  <button
                    onClick={onLogout}
                    className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span className="flex-1 text-left">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              /* Not Logged In View */
              <div className="p-4">
                <div className="mb-4 text-center">
                  <p className="text-sm font-medium text-white">Welcome to KwetuShop!</p>
                  <p className="mt-1 text-xs text-gray-400">Sign in to access your account</p>
                </div>
                
                <button
                  onClick={() => {
                    onNavigate('/login');
                    setDropdownOpen(false);
                  }}
                  className="relative w-full px-4 py-3 overflow-hidden text-sm font-medium text-white transition-all rounded-full group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    <FiLogIn className="w-4 h-4" />
                    Sign In / Register
                  </span>
                </button>
                
                <p className="mt-3 text-xs text-center text-gray-500">
                  New here? Sign in to create an account
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;