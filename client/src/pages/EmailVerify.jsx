// src/pages/EmailVerify.jsx - UPDATED with LoadingSpinner
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { BsLightningCharge, BsArrowRight } from "react-icons/bs";
import { FiMail, FiMapPin } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";

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
  
  .glow-text {
    text-shadow: 0 0 30px rgba(234, 179, 8, 0.5);
  }
`;

// Animation styles
const animationStyles = `
  @keyframes gradient {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0.1; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  
  .animate-gradient {
    animation: gradient 8s ease-in-out infinite;
  }
  
  .animate-pulse {
    animation: pulse 3s ease-in-out infinite;
  }
  
  .delay-1000 {
    animation-delay: 1s;
  }
  
  .card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .card-3d-content {
    transform: translateZ(20px);
  }
`;

// Background image
const emailVerifyBackgroundImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for bottom transition - yellow/orange/red (matching Login page)
const bottomGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Top Bar Component (matching homepage)
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-3 border-b border-gray-800 bg-black/90 backdrop-blur-sm">
      <div className="flex items-center justify-end px-6 mx-auto space-x-6 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <FiMapPin className="w-4 h-4" />
          FIND STORE
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

const EmailVerify = () => {
  const navigate = useNavigate();
  const { backendUrl, getUserData } = useContext(AppContext);
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    
    // Simulate initial page load
    setTimeout(() => {
      setPageLoading(false);
    }, 500);
    
    return () => document.head.removeChild(style);
  }, []);

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

  // Page loading state
  if (pageLoading) {
    return (
      <div className="relative h-screen overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img 
            src={emailVerifyBackgroundImage}
            alt="Background"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${bottomGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner message="Loading verification page..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      {/* Full-page Background Image */}
      <div className="absolute inset-0">
        <img 
          src={emailVerifyBackgroundImage}
          alt="Background"
          className="object-cover w-full h-full"
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Bottom gradient - yellow/orange/red (matching Login page) */}
        <div className={`absolute inset-0 bg-gradient-to-t ${bottomGradient} mix-blend-overlay`}></div>
        {/* Final black gradient at the very bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      {/* Animated Glow Orbs - positioned on top of background - updated to yellow/orange */}
      <div className="absolute rounded-full w-96 h-96 bg-yellow-600/30 blur-3xl -top-48 -left-48 animate-pulse"></div>
      <div className="absolute delay-1000 rounded-full w-96 h-96 bg-orange-600/30 blur-3xl -bottom-48 -right-48 animate-pulse"></div>

      {/* Top Bar - with semi-transparent background */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <TopBar />
      </div>

      {/* Logo with glow - positioned absolutely - updated to yellow */}
      <div 
        onClick={() => navigate("/")} 
        className="absolute z-30 cursor-pointer left-5 sm:left-20 top-20 group"
      >
        <div className="relative">
          <div className="absolute transition-opacity rounded-full opacity-0 -inset-2 bg-gradient-to-r from-yellow-600 to-orange-600 group-hover:opacity-30 blur-xl"></div>
          <img 
            src={assets.logo} 
            alt="Logo" 
            className="relative transition-transform w-28 sm:w-32 group-hover:scale-105" 
          />
        </div>
      </div>

      {/* Back button - matching Login page style */}
      <div className="absolute z-30 top-4 right-4">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white transition-all border border-gray-700 rounded-full bg-black/50 backdrop-blur-sm hover:border-yellow-500/50"
        >
          <span className="text-yellow-500">←</span> Back to Home
        </button>
      </div>

      {/* Centered Verification Card - No scrolling */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          {/* Verification Card */}
          <div className="relative card-3d">
            {/* Glow Effect - updated to yellow/orange */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl opacity-30 blur-xl"></div>
            
            <div className="relative p-6 border border-gray-800 rounded-2xl bg-gray-900/95 backdrop-blur-sm sm:p-8 card-3d-content">
              {/* Icon - updated to yellow/orange gradient */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                    <FiMail className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full opacity-50 blur-xl"></div>
                </div>
              </div>

              <h2 className="mb-2 text-2xl font-bold text-center text-white">
                Verify Your Email
              </h2>
              <p className="mb-6 text-sm text-center text-gray-400">
                Enter the 6-digit code sent to your email
              </p>

              <form onSubmit={onSubmitHandler}>
                {/* OTP Inputs - updated focus ring to yellow */}
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
                      className="h-12 text-lg font-semibold text-center text-white transition-all border border-gray-700 rounded-lg shadow-sm outline-none w-11 sm:w-12 sm:h-14 sm:text-xl bg-gray-800/95 backdrop-blur-sm focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                      disabled={isLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {/* Submit Button - updated to yellow/orange gradient matching Login page */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full py-3 font-medium text-white transition-all rounded-full overflow-hidden sm:py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Email
                        <BsArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Resend Section - updated to yellow */}
              <div className="mt-4 text-sm text-center">
                {resendTimer > 0 ? (
                  <span className="text-gray-500">
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-yellow-500 transition-colors hover:text-yellow-400 hover:underline disabled:opacity-50"
                  >
                    Didn't receive the code? Resend
                  </button>
                )}
              </div>

              {/* Security Note - updated to yellow theme */}
              <div className="flex items-center gap-2 p-3 mt-4 text-xs border rounded-lg bg-yellow-600/10 border-yellow-600/20">
                <BsLightningCharge className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-400">
                  Never share your verification code
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;