// src/components/navbar/VerificationBanner.jsx
import React from 'react';
import { FiX, FiClock } from 'react-icons/fi';
import { IoFlashOutline } from 'react-icons/io5';
import { BsLightningCharge } from 'react-icons/bs';

const VerificationBanner = ({ onVerify, onClose, verifyLoading }) => {
  return (
    <div className="relative border-b border-yellow-500/20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-600/10 via-orange-600/10 to-transparent"></div>
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
        <div className="flex flex-col items-start justify-between gap-2 xs:flex-row xs:items-center xs:gap-3">
          <div className="flex items-start w-full gap-2 xs:items-center sm:gap-3 xs:w-auto">
            <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 border rounded-full sm:w-7 sm:h-7 bg-yellow-600/20 border-yellow-500/30">
              <IoFlashOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
            </div>
            <div className="flex-1 text-xs xs:flex-none sm:text-sm">
              <span className="font-medium text-yellow-500 glow-text">Verify your email</span>
              <span className="hidden sm:inline text-gray-400 ml-1.5">
                to unlock all features
              </span>
            </div>
          </div>
          <div className="flex items-center w-full gap-2 xs:w-auto">
            <button
              onClick={onVerify}
              disabled={verifyLoading}
              className="group relative flex-1 xs:flex-none px-3 sm:px-4 py-1.5 text-xs font-medium text-white transition-all rounded-full overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
              <span className="absolute inset-0 transition-opacity opacity-50 bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl group-hover:opacity-100"></span>
              <span className="relative flex items-center justify-center gap-1.5">
                {verifyLoading ? (
                  <>
                    <FiClock className="w-3 h-3 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <BsLightningCharge className="w-3 h-3" />
                    <span>Verify Now</span>
                  </>
                )}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationBanner;