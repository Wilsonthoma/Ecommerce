// src/pages/ResetPassword.jsx - RESTYLED to match Login page theme
import React, { useState, useRef, useContext, useEffect, useCallback } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { IoArrowBack } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";

// Reset password background image (same as login)
const resetBackgroundImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Yellow-orange gradient for overlay (matching login)
const bottomGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { backendUrl, refreshCsrfToken } = useContext(AppContext);

  // State
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpAutoSubmit, setOtpAutoSubmit] = useState(false);
  const inputRefs = useRef([]);
  const autoSubmitTimeoutRef = useRef(null);
  const isAutoSubmittingRef = useRef(false);

  // Step 2: Verify OTP
  const handleVerifyOtp = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    const otp = inputRefs.current.map((el) => el?.value).join("");
    console.log("🔐 Verifying OTP:", otp, "for email:", email);
    
    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits");
      setOtpAutoSubmit(false);
      isAutoSubmittingRef.current = false;
      return;
    }

    if (!/^\d+$/.test(otp)) {
      toast.error("OTP should contain only numbers");
      setOtpAutoSubmit(false);
      isAutoSubmittingRef.current = false;
      return;
    }

    setIsLoading(true);
    try {
      console.log("🚀 Making OTP verification request...");
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-reset-otp`,
        { email, otp },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
          },
        }
      );

      console.log("✅ OTP verification response:", data);

      if (data.success) {
        toast.success(data.message || "OTP verified successfully");
        setVerifiedOtp(otp);
        setStep(3);
        console.log("OTP verified successfully, moving to step 3");
      } else {
        console.log("OTP verification failed:", data.message);
        toast.error(data.message || "Invalid OTP");
        inputRefs.current.forEach(input => {
          if (input) input.value = '';
        });
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      
      if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
        try {
          console.log("🔄 CSRF token expired, refreshing and retrying...");
          await refreshCsrfToken();
          const retryData = await axios.post(
            `${backendUrl}/api/auth/verify-reset-otp`,
            { email, otp },
            {
              withCredentials: true,
              headers: {
                "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
              },
            }
          );
          console.log("🔄 Retry response:", retryData.data);
          if (retryData.data.success) {
            toast.success("OTP verified successfully");
            setVerifiedOtp(otp);
            setStep(3);
            return;
          }
        } catch (retryError) {
          console.error("❌ Retry failed:", retryError);
        }
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          "Invalid OTP. Please try again.";
      toast.error(errorMessage);
      
      inputRefs.current.forEach(input => {
        if (input) input.value = '';
      });
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
      setOtpAutoSubmit(false);
      isAutoSubmittingRef.current = false;
    }
  }, [email, backendUrl, refreshCsrfToken]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
      }
    };
  }, []);

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Reset auto-submit state when step changes
  useEffect(() => {
    if (step !== 2) {
      setOtpAutoSubmit(false);
      isAutoSubmittingRef.current = false;
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
      }
    }
  }, [step]);

  // Move focus to next input + Auto-submit when last digit entered
  const handleInput = (e, index) => {
    const value = e.target.value;
    
    if (!/^\d*$/.test(value)) {
      e.target.value = '';
      return;
    }

    if (value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }

    if (value.length > 0 && index === inputRefs.current.length - 1) {
      const allFilled = inputRefs.current.every(input => input && input.value.length > 0);
      if (allFilled && !isAutoSubmittingRef.current) {
        setOtpAutoSubmit(true);
        isAutoSubmittingRef.current = true;
        console.log("🔄 Auto-submit triggered - All OTP digits filled");
        
        if (autoSubmitTimeoutRef.current) {
          clearTimeout(autoSubmitTimeoutRef.current);
        }
        
        autoSubmitTimeoutRef.current = setTimeout(() => {
          handleAutoSubmitOtp();
        }, 300);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^[0-9]+$/.test(pastedData)) {
      toast.error("Only numbers are allowed in OTP");
      return;
    }
    
    const digits = pastedData.slice(0, 6).split("");
    digits.forEach((digit, i) => {
      if (inputRefs.current[i]) inputRefs.current[i].value = digit;
    });

    const lastFilledIndex = Math.min(digits.length, 5);
    if (inputRefs.current[lastFilledIndex]) {
      inputRefs.current[lastFilledIndex].focus();
    }

    if (digits.length === 6 && !isAutoSubmittingRef.current) {
      setOtpAutoSubmit(true);
      isAutoSubmittingRef.current = true;
      console.log("🔄 Auto-submit triggered - OTP pasted");
      
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
      }
      
      autoSubmitTimeoutRef.current = setTimeout(() => {
        handleAutoSubmitOtp();
      }, 300);
    }
  };

  const handleAutoSubmitOtp = useCallback(async () => {
    console.log("🔄 handleAutoSubmitOtp called");
    
    if (!isAutoSubmittingRef.current) {
      console.log("❌ Auto-submit cancelled - already completed or cancelled");
      return;
    }
    
    const otp = inputRefs.current.map((el) => el?.value).join("");
    console.log("📱 Auto-submit OTP:", otp);
    
    if (otp.length !== 6) {
      console.log("❌ Auto-submit cancelled - OTP length not 6");
      setOtpAutoSubmit(false);
      isAutoSubmittingRef.current = false;
      return;
    }

    if (!/^\d+$/.test(otp)) {
      toast.error("OTP should contain only numbers");
      setOtpAutoSubmit(false);
      isAutoSubmittingRef.current = false;
      return;
    }

    console.log("✅ Calling handleVerifyOtp from auto-submit");
    await handleVerifyOtp();
  }, [handleVerifyOtp]);

  // Step 1: Send reset OTP
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      console.log("📧 Sending reset OTP to:", email);
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        { email },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
          },
        }
      );

      console.log("📧 Send OTP response:", data);

      if (data.success) {
        toast.success(data.message || "Verification code sent to your email!");
        setStep(2);
        setResendTimer(60);
      } else {
        toast.error(data.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("❌ Send OTP Error:", error);
      console.error("❌ Error details:", error.response?.data);
      
      if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
        try {
          console.log("🔄 CSRF token expired, refreshing...");
          await refreshCsrfToken();
          const retryData = await axios.post(
            `${backendUrl}/api/auth/send-reset-otp`,
            { email },
            {
              withCredentials: true,
              headers: {
                "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
              },
            }
          );
          if (retryData.data.success) {
            toast.success("Verification code sent!");
            setStep(2);
            setResendTimer(60);
            return;
          }
        } catch (retryError) {
          console.error("❌ Retry failed:", retryError);
        }
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          "Failed to send verification code. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds before resending`);
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔄 Resending OTP to:", email);
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        { email },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
          },
        }
      );

      console.log("📧 Resend OTP response:", data);

      if (data.success) {
        toast.success(data.message || "Verification code resent!");
        setResendTimer(60);
      } else {
        toast.error(data.message || "Failed to resend verification code");
      }
    } catch (error) {
      console.error("❌ Resend OTP Error:", error);
      
      if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
        try {
          await refreshCsrfToken();
          const retryData = await axios.post(
            `${backendUrl}/api/auth/send-reset-otp`,
            { email },
            {
              withCredentials: true,
              headers: {
                "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
              },
            }
          );
          if (retryData.data.success) {
            toast.success("Verification code resent!");
            setResendTimer(60);
            return;
          }
        } catch (retryError) {
          console.error("❌ Retry failed:", retryError);
        }
      }
      
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔑 Resetting password for:", email);
      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        {
          email,
          otp: verifiedOtp,
          newPassword: password
        },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
          },
        }
      );

      console.log("✅ Password reset response:", data);

      if (data.success) {
        toast.success(data.message || "Password reset successful!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("❌ Password Reset Error:", error);
      
      if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
        try {
          await refreshCsrfToken();
          const retryData = await axios.post(
            `${backendUrl}/api/auth/reset-password`,
            {
              email,
              otp: verifiedOtp,
              newPassword: password
            },
            {
              withCredentials: true,
              headers: {
                "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
              },
            }
          );
          if (retryData.data.success) {
            toast.success("Password reset successful!");
            setTimeout(() => {
              navigate("/login");
            }, 2000);
            return;
          }
        } catch (retryError) {
          console.error("❌ Retry failed:", retryError);
        }
      }
      
      if (error.response) {
        const { status, data: errorData } = error.response;
        
        if (status === 400) {
          const errorMessage = errorData?.message || errorData?.error || "";
          
          if (errorMessage.includes("cannot be the same") || errorMessage.includes("same as your current")) {
            toast.error("New password cannot be the same as your old password. Please choose a different password.");
            setPassword("");
            setConfirmPassword("");
          } 
          else if (errorMessage.includes("OTP") || errorMessage.includes("otp") || errorMessage.includes("expired")) {
            toast.error("OTP session has expired. Please request a new code.");
            setStep(2);
            setVerifiedOtp("");
          } else {
            toast.error(errorMessage || "Invalid request. Please check your input.");
          }
        } else if (status === 429) {
          toast.error(errorData?.message || "Too many attempts. Please try again later.");
        } else if (status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(errorData?.message || "Password reset failed");
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2) {
        inputRefs.current.forEach(input => {
          if (input) input.value = '';
        });
        setVerifiedOtp("");
        setOtpAutoSubmit(false);
        isAutoSubmittingRef.current = false;
      }
      if (step === 3) {
        setPassword("");
        setConfirmPassword("");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Full-page Background Image */}
      <div className="absolute inset-0">
        <img 
          src={resetBackgroundImage}
          alt="Background"
          className="object-cover w-full h-full"
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Yellow-orange gradient overlay (matching login) */}
        <div className={`absolute inset-0 bg-gradient-to-t ${bottomGradient} mix-blend-overlay`}></div>
        {/* Final black gradient at the very bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      {/* Animated gradient overlay (matching login) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-yellow-600/5 via-orange-600/5 to-red-600/5 animate-gradient"></div>

      {/* Back to Home Button - matching login page style */}
      <div className="absolute z-20 top-4 left-4">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white transition-all border border-gray-700 rounded-full bg-black/50 backdrop-blur-sm hover:border-yellow-500/50"
        >
          <span className="text-yellow-500">←</span> Back
        </button>
      </div>

      {/* Centered Reset Password Card - matching login card size */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[320px] px-3">
          {/* Card with matching login styling */}
          <div className="relative p-5 text-center border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm">
            
            {/* Back Arrow Button - matching login's back button style */}
            <button
              onClick={handleBack}
              className="absolute p-1.5 transition-all border border-gray-700 rounded-full -left-2 -top-2 bg-gray-900 hover:border-yellow-500/50 hover:bg-gray-800 focus:outline-none"
              aria-label="Go back"
            >
              <IoArrowBack className="w-3.5 h-3.5 text-gray-400 transition-colors hover:text-yellow-500" />
            </button>

            {/* Logo (matching login) */}
            <div className="flex justify-center mb-3">
              <img 
                src={assets.logo} 
                alt="KwetuShop" 
                className="w-auto h-8 sm:h-9" 
              />
            </div>

            {/* Step 1: Email input */}
            {step === 1 && (
              <>
                <h2 className="mb-1 text-base font-semibold text-white">Reset Password</h2>
                <p className="mb-4 text-xs text-gray-400">
                  Enter your registered email to receive a verification code
                </p>

                <form onSubmit={handleSendResetOtp}>
                  <div className="flex items-center w-full px-3 py-2 mb-3 border border-gray-700 rounded-lg bg-gray-800/95 focus-within:border-yellow-500/50">
                    <img
                      src={assets.mail_icon}
                      alt="Mail"
                      className="w-4 h-4 opacity-70"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full px-2 text-xs text-white placeholder-gray-400 bg-transparent outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-2 mt-1 overflow-hidden text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:shadow-lg hover:shadow-orange-600/20 disabled:opacity-50"
                  >
                    {isLoading ? "Sending..." : "Send Code"}
                  </button>
                </form>

                <p className="mt-3 text-xs text-gray-400">
                  Remember your password?{" "}
                  <span 
                    className="font-medium text-yellow-500 cursor-pointer hover:text-yellow-400"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </span>
                </p>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <>
                <h2 className="mb-1 text-base font-semibold text-white">Verify Email</h2>
                <p className="mb-1 text-xs text-gray-400">
                  Enter the 6-digit code sent to
                </p>
                <p className="mb-4 text-xs font-medium text-yellow-500 break-all">{email}</p>

                <form onSubmit={handleVerifyOtp}>
                  <div
                    className="flex justify-center gap-1 mb-4"
                    onPaste={handlePaste}
                  >
                    {Array(6)
                      .fill(0)
                      .map((_, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength="1"
                          ref={(el) => (inputRefs.current[index] = el)}
                          onInput={(e) => handleInput(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-8 h-10 text-sm font-semibold text-center text-white border border-gray-700 rounded-lg bg-gray-800/95 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                          disabled={isLoading || otpAutoSubmit}
                        />
                      ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpAutoSubmit}
                    className="relative w-full py-2 mb-2 overflow-hidden text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:shadow-lg hover:shadow-orange-600/20 disabled:opacity-50"
                  >
                    {isLoading || otpAutoSubmit ? "Verifying..." : "Verify Code"}
                  </button>
                </form>

                <div className="text-xs text-gray-400">
                  {otpAutoSubmit ? (
                    <span className="text-yellow-500">Verifying...</span>
                  ) : (
                    <>
                      {resendTimer > 0 ? (
                        <span className="text-gray-500">
                          Resend in {resendTimer}s
                        </span>
                      ) : (
                        <span 
                          className="font-medium text-yellow-500 cursor-pointer hover:text-yellow-400"
                          onClick={handleResendOtp}
                        >
                          Resend Code
                        </span>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <>
                <h2 className="mb-1 text-base font-semibold text-white">New Password</h2>
                <p className="mb-4 text-xs text-gray-400">
                  Create a strong password
                </p>

                <form onSubmit={handleResetPassword}>
                  <div className="relative flex items-center w-full px-3 py-2 mb-2 border border-gray-700 rounded-lg bg-gray-800/95 focus-within:border-yellow-500/50">
                    <img
                      src={assets.lock_icon}
                      alt="Password"
                      className="w-4 h-4 opacity-70"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New password"
                      className="w-full px-2 text-xs text-white placeholder-gray-400 bg-transparent outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength="6"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute text-gray-400 transition cursor-pointer right-2 top-2 hover:text-yellow-500"
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible size={14} />
                      ) : (
                        <AiOutlineEye size={14} />
                      )}
                    </button>
                  </div>

                  <div className="relative flex items-center w-full px-3 py-2 mb-3 border border-gray-700 rounded-lg bg-gray-800/95 focus-within:border-yellow-500/50">
                    <img
                      src={assets.lock_icon}
                      alt="Confirm Password"
                      className="w-4 h-4 opacity-70"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      className="w-full px-2 text-xs text-white placeholder-gray-400 bg-transparent outline-none"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute text-gray-400 transition cursor-pointer right-2 top-2 hover:text-yellow-500"
                    >
                      {showConfirmPassword ? (
                        <AiOutlineEyeInvisible size={14} />
                      ) : (
                        <AiOutlineEye size={14} />
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-2 mt-1 overflow-hidden text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:shadow-lg hover:shadow-orange-600/20 disabled:opacity-50"
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add animation keyframes for gradient (matching login) */}
      <style>{`
        @keyframes gradient {
          0% { opacity: 0.1; }
          50% { opacity: 0.3; }
          100% { opacity: 0.1; }
        }
        .animate-gradient {
          animation: gradient 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;