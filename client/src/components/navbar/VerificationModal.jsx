// src/components/navbar/VerificationModal.jsx
import React, { useRef } from 'react';
import { FiMail, FiX, FiClock, FiShield } from 'react-icons/fi';

const VerificationModal = ({
  isOpen,
  userEmail,
  verifyOtp,
  onOtpChange,
  onVerifySubmit,
  onResend,
  onClose,
  verifyLoading,
  resendTimer
}) => {
  const otpInputRefs = useRef([]);

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasted)) return;
    const digits = pasted.slice(0, 6).split("");
    digits.forEach((digit, i) => {
      if (i < 6) onOtpChange(i, digit);
    });
    otpInputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verifyOtp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md animate-slideUp">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl opacity-30 blur-xl"></div>
        <div className="relative border border-gray-800 shadow-2xl bg-gradient-to-b from-gray-900 to-black rounded-2xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                    <FiMail className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full opacity-50 blur"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Verify Your Email</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Enter the 6-digit code sent to</p>
                  <p className="text-sm font-semibold text-yellow-500">{userEmail}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onVerifySubmit}>
              <div
                className="flex justify-center gap-2 mb-6 sm:gap-3"
                onPaste={handlePaste}
              >
                {verifyOtp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => onOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-xl font-bold text-center text-white transition-all bg-gray-800 border-2 border-gray-700 outline-none sm:w-14 sm:h-14 sm:text-2xl rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    disabled={verifyLoading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400">
                  <FiClock className="w-4 h-4" />
                  <span>Code expires in <span className="font-semibold text-yellow-500">10 minutes</span></span>
                </div>
                {resendTimer > 0 ? (
                  <span className="text-xs text-gray-500 sm:text-sm">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onResend}
                    disabled={verifyLoading}
                    className="text-xs font-medium text-yellow-500 sm:text-sm hover:text-yellow-400 hover:underline disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={verifyLoading || verifyOtp.join("").length !== 6}
                  className="relative flex-1 px-6 py-3 overflow-hidden text-sm font-medium text-white transition-all rounded-full group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    {verifyLoading ? (
                      <>
                        <FiClock className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-medium text-gray-300 transition-colors bg-gray-800 rounded-full hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="flex items-start gap-2 p-3 mt-4 border rounded-xl bg-yellow-600/10 border-yellow-600/20">
              <FiShield className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400">
                Never share your verification code. Our team will never ask for this code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;