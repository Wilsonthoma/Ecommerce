// src/components/VerifyAccountButton.jsx - TRANSFORMED with oraimo black gradients and glowing effects
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import { FiMail, FiClock, FiX, FiShield, FiCheckCircle } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { BsLightningCharge, BsArrowRight } from "react-icons/bs";

const VerifyAccountButton = () => {
  const { backendUrl, user, getUserData } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  // Already verified badge
  if (user?.isAccountVerified) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-500 rounded-full sm:gap-2 sm:px-4 sm:py-2 sm:text-sm bg-green-500/10 border border-green-500/30">
        <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Verified</span>
      </div>
    );
  }

  // Send OTP
  const handleSendOtp = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        {},
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
          },
        }
      );

      if (response.data.success) {
        toast.success("📧 Verification code sent!");
        setIsModalOpen(true);
        setResendTimer(60);
        
        if (process.env.NODE_ENV === 'development' && response.data.otp) {
          console.log("🔐 OTP:", response.data.otp);
        }
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error(error.response?.data?.message || "Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace handler
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste handler
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error("Only numbers are allowed");
      return;
    }

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    
    setOtp(newOtp);

    const lastIndex = Math.min(digits.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/verify-email`,
        { otp: otpString },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
          },
        }
      );

      if (response.data.success) {
        toast.success("✅ Email verified successfully!");
        setIsModalOpen(false);
        await getUserData();
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      console.error("Verify error:", error);
      toast.error(error.response?.data?.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds`);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        {},
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
          },
        }
      );

      if (response.data.success) {
        toast.success("📧 Code resent!");
        setResendTimer(60);
        setOtp(["", "", "", "", "", ""]);
        
        if (process.env.NODE_ENV === 'development' && response.data.otp) {
          console.log("🔐 New OTP:", response.data.otp);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend");
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  return (
    <>
      {/* Verify Button - ORAIMO Style with Black Gradient */}
      <button
        onClick={handleSendOtp}
        disabled={isLoading}
        className="group relative w-full px-5 py-2.5 text-sm font-medium text-white transition-all rounded-full overflow-hidden sm:w-auto"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <FiClock className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <FiMail className="w-4 h-4" />
              <span>Verify Account</span>
              <BsArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </>
          )}
        </span>
      </button>

      {/* OTP Modal - ORAIMO Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md animate-slideUp">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-30 blur-xl"></div>
            
            {/* Modal Content */}
            <div className="relative overflow-hidden border rounded-2xl bg-gradient-to-br from-gray-900 to-black border-gray-800">
              {/* Header with Gradient */}
              <div className="relative px-6 py-8 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-800">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="absolute p-2 transition-all rounded-full shadow-lg top-4 right-4 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] group"
                >
                  <FiX className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </button>
                
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                    <FiMail className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-50 blur-xl"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-center text-white glow-text">
                  Verify Email
                </h3>
                <p className="mt-2 text-sm text-center text-gray-400">
                  Enter the 6-digit code sent to
                </p>
                <p className="text-sm font-semibold text-center text-blue-500 break-all">
                  {user?.email}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <form onSubmit={handleVerifyOtp}>
                  
                  {/* OTP Inputs - Glowing */}
                  <div
                    className="flex justify-center mb-6 space-x-2 sm:space-x-3"
                    onPaste={handlePaste}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-11 h-12 text-lg font-bold text-center text-white transition-all border rounded-lg shadow-sm outline-none sm:w-12 sm:h-14 sm:text-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        disabled={isLoading}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {/* Timer & Resend */}
                  <div className="flex flex-col items-center justify-between gap-3 p-4 mb-5 border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FiClock className="w-4 h-4 text-blue-500" />
                      <span>
                        Expires in{" "}
                        <span className="font-bold text-blue-500">
                          {Math.floor(resendTimer / 60)}:
                          {(resendTimer % 60).toString().padStart(2, "0")}
                        </span>
                      </span>
                    </div>
                    
                    {resendTimer > 0 ? (
                      <span className="text-sm font-medium text-gray-500">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-sm font-semibold text-blue-500 hover:text-blue-400 hover:underline disabled:opacity-50 transition-colors"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="submit"
                      disabled={isLoading || otp.join("").length !== 6}
                      className="group relative flex-1 px-6 py-3 text-sm font-semibold text-white transition-all rounded-full overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <FiClock className="w-4 h-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify Email
                            <BsArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      className="px-6 py-3 text-sm font-medium text-gray-400 transition-colors border rounded-full border-gray-700 hover:text-white hover:border-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {/* Security Note */}
                <div className="flex items-start gap-3 p-4 mt-5 border rounded-lg bg-blue-600/10 border-blue-600/20">
                  <FiShield className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-400">
                    Never share your verification code. Support will never ask for this.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .glow-text {
          text-shadow: 0 0 20px currentColor;
        }
      `}</style>
    </>
  );
};

export default VerifyAccountButton;