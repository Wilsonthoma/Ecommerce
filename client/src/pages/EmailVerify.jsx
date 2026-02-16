// src/pages/EmailVerify.jsx - TRANSFORMED with oraimo black gradients and glowing effects
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { BsLightningCharge, BsArrowRight } from "react-icons/bs";
import { FiMail } from "react-icons/fi";

const EmailVerify = () => {
  const navigate = useNavigate();
  const { backendUrl, getUserData } = useContext(AppContext);
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Configure Axios
  axios.defaults.withCredentials = true;

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/csrf-token`, {
          withCredentials: true,
        });
        axios.defaults.headers.common["X-CSRF-Token"] = data.csrfToken;
      } catch (error) {
        console.error("CSRF token fetch failed:", error);
      }
    };
    fetchCsrfToken();
  }, [backendUrl]);

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Move to next input
  const handleInput = (e, index) => {
    const value = e.target.value;
    
    if (!/^\d*$/.test(value)) {
      e.target.value = '';
      return;
    }

    if (value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Move back on backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (!/^[0-9]+$/.test(pastedData)) {
      toast.error("Only numbers are allowed");
      return;
    }

    const digits = pastedData.slice(0, 6).split("");
    
    digits.forEach((digit, i) => {
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = digit;
      }
    });

    const lastFilled = Math.min(digits.length, 6) - 1;
    if (lastFilled >= 0 && inputRefs.current[lastFilled]) {
      inputRefs.current[lastFilled].focus();
    }
  };

  // Submit handler
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    const otp = inputRefs.current.map((el) => el.value).join("");

    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-email`,
        { otp },
        {
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"],
          },
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success(data.message || "Email verified successfully! 🎉");
        await getUserData();
        navigate("/");
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error.response?.data?.message || "Verification failed");
      
      inputRefs.current.forEach(input => {
        if (input) input.value = '';
      });
      if (inputRefs.current[0]) inputRefs.current[0].focus();
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
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        {},
        {
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"],
          },
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success("Verification code resent!");
        setResendTimer(60);
      } else {
        toast.error(data.message || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
      
      {/* Animated Glow Orbs */}
      <div className="absolute w-96 h-96 bg-blue-600/30 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-purple-600/30 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>

      {/* Logo with glow */}
      <div 
        onClick={() => navigate("/")} 
        className="absolute cursor-pointer left-5 sm:left-20 top-5 group"
      >
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-opacity"></div>
          <img 
            src={assets.logo} 
            alt="Logo" 
            className="relative w-28 sm:w-32 transition-transform group-hover:scale-105" 
          />
        </div>
      </div>

      {/* Verification Card */}
      <div className="relative w-full max-w-md">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-30 blur-xl"></div>
        
        <div className="relative p-6 border rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 sm:p-8">
          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <FiMail className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-50 blur-xl"></div>
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-center text-white glow-text">
            Verify Your Email
          </h2>
          <p className="mb-6 text-sm text-center text-gray-400">
            Enter the 6-digit code sent to your email
          </p>

          <form onSubmit={onSubmitHandler}>
            {/* OTP Inputs - Glowing */}
            <div
              className="flex justify-center mb-8 space-x-2 sm:space-x-3"
              onPaste={handlePaste}
            >
              {Array(6).fill(0).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-11 h-12 text-lg font-semibold text-center text-white transition-all border rounded-lg shadow-sm outline-none sm:w-12 sm:h-14 sm:text-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  disabled={isLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full py-3 font-medium text-white transition-all rounded-full overflow-hidden sm:py-3.5"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
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
          </form>

          {/* Resend Section */}
          <div className="mt-4 text-sm text-center">
            {resendTimer > 0 ? (
              <span className="text-gray-500">
                Resend code in {resendTimer}s
              </span>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-blue-500 hover:text-blue-400 hover:underline disabled:opacity-50 transition-colors"
              >
                Didn't receive the code? Resend
              </button>
            )}
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-2 p-3 mt-4 text-xs border rounded-lg bg-blue-600/10 border-blue-600/20">
            <BsLightningCharge className="w-4 h-4 text-blue-500" />
            <span className="text-blue-400">
              Never share your verification code
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .glow-text {
          text-shadow: 0 0 20px currentColor;
        }
      `}</style>
    </div>
  );
};

export default EmailVerify;