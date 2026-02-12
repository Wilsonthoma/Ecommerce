import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import { FiMail, FiClock, FiX, FiShield } from "react-icons/fi";
import { MdVerified } from "react-icons/md";

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
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-full sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
        <MdVerified className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
      {/* Verify Button - ResetPassword Color Scheme */}
      <button
        onClick={handleSendOtp}
        disabled={isLoading}
        className="relative flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 bg-gradient-to-r from-green-400 to-emerald-600 rounded-lg hover:from-green-500 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 sm:w-auto sm:px-5"
      >
        {isLoading ? (
          <>
            <FiClock className="w-4 h-4 animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <FiMail className="w-4 h-4" />
            <span>Verify Account</span>
          </>
        )}
      </button>

      {/* OTP Modal - ResetPassword Color Scheme */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl animate-slideUp">
            
            {/* Modal Header - ResetPassword Gradient */}
            <div className="relative px-6 py-8 bg-gradient-to-br from-green-400 to-emerald-600">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="absolute p-1.5 text-white transition-colors rounded-lg top-4 right-4 hover:bg-white/20"
              >
                <FiX className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white rounded-full shadow-lg">
                <FiMail className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-center text-white">
                Verify Email
              </h3>
              <p className="mt-2 text-sm text-center text-green-100">
                Enter the 6-digit code sent to
              </p>
              <p className="text-sm font-semibold text-center text-white break-all">
                {user?.email}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleVerifyOtp}>
                
                {/* OTP Inputs - Responsive */}
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
                      className="w-11 h-12 text-lg font-bold text-center text-gray-900 transition-all border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none shadow-sm hover:border-green-300 sm:w-12 sm:h-14 sm:text-xl"
                      disabled={isLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {/* Timer & Resend */}
                <div className="flex flex-col items-center justify-between gap-3 p-3 mb-5 rounded-lg bg-green-50 sm:flex-row sm:p-4">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <FiClock className="w-4 h-4" />
                    <span>
                      Expires in{" "}
                      <span className="font-bold text-green-900">
                        {Math.floor(resendTimer / 60)}:
                        {(resendTimer % 60).toString().padStart(2, "0")}
                      </span>
                    </span>
                  </div>
                  
                  {resendTimer > 0 ? (
                    <span className="text-sm font-medium text-green-700">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline disabled:opacity-50"
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
                    className="flex-1 px-6 py-3 text-sm font-semibold text-white transition-all bg-gradient-to-r from-green-400 to-emerald-600 rounded-lg hover:from-green-500 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <FiClock className="w-4 h-4 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify Email"
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {/* Security Note */}
              <div className="flex items-start gap-3 p-3 mt-5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                <FiShield className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-800">
                  Never share your verification code. Support will never ask for this.
                </p>
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
      `}</style>
    </>
  );
};

export default VerifyAccountButton;