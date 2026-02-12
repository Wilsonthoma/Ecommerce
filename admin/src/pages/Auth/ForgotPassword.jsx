import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Clock, Key } from "lucide-react";

// Base URL for API calls (Change this if your backend port is different)
const API_BASE_URL = 'http://localhost:5000/api/admin/auth';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || "";
  
  // State
  const [email, setEmail] = useState(initialEmail);
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

  // --- Utility Functions ---

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // --- Effects ---

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

  // --- OTP Input Handlers ---

  // Move focus to next input + Auto-submit when last digit entered
  const handleInput = (e, index) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      e.target.value = '';
      return;
    }

    // If user entered a digit and there are more inputs, move focus
    if (value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Check if all OTP digits are filled for auto-submit
    if (value.length > 0 && index === inputRefs.current.length - 1) {
      const allFilled = inputRefs.current.every(input => input && input.value && input.value.length > 0);
      if (allFilled && !isAutoSubmittingRef.current) {
        setOtpAutoSubmit(true);
        isAutoSubmittingRef.current = true;
        // Fast delay for instant feel
        if (autoSubmitTimeoutRef.current) {
          clearTimeout(autoSubmitTimeoutRef.current);
        }
        autoSubmitTimeoutRef.current = setTimeout(() => {
          handleAutoSubmitOtp();
        }, 50);
      }
    }
  };

  // Move focus back on backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste event for OTP + Auto-submit
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

    // Focus the last filled input
    const lastFilledIndex = Math.min(digits.length - 1, 5);
    if (inputRefs.current[lastFilledIndex]) {
      inputRefs.current[lastFilledIndex].focus();
    }

    // Auto-submit if all 6 digits are pasted
    if (digits.length === 6 && !isAutoSubmittingRef.current) {
      setOtpAutoSubmit(true);
      isAutoSubmittingRef.current = true;
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
      }
      autoSubmitTimeoutRef.current = setTimeout(() => {
        handleAutoSubmitOtp();
      }, 50);
    }
  };

  // Auto-submit OTP when all digits are entered
  const handleAutoSubmitOtp = async () => {
    if (!isAutoSubmittingRef.current) {
      return;
    }
    
    const otp = inputRefs.current.map((el) => el?.value).join("");
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      // Clean up if validation fails
      setOtpAutoSubmit(false);
      isAutoSubmittingRef.current = false;
      if (otp.length !== 6) toast.error("OTP must be 6 digits.");
      if (!/^\d+$/.test(otp)) toast.error("OTP should contain only numbers.");
      return;
    }

    await handleVerifyOtp();
  };

  // --- API Handlers ---

  // Step 1: Send reset OTP
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (data.success) {
        
        // --- START FIX: Prevent duplicate toast messages ---
        if (data.otp) {
          // If OTP is returned (development), show the specific message
          toast.success(`Development OTP: ${data.otp}. Code sent to email.`); 
        } else {
          // Otherwise, show the generic success message
          toast.success(data.message || "Verification code sent to your email!");
        }
        // --- END FIX ---

        setStep(2);
        setResendTimer(60);
      } else {
        toast.error(data.error || "Failed to send verification code");
      }
    } catch (error) {
      // Improved error handling
      const errorMessage = error.message.includes('Failed to fetch') 
        ? "Network error. Please check your connection." 
        : "An unexpected error occurred. Please try again.";
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

    if (!email) {
      toast.error("Email not found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (data.success) {
        
        // --- START FIX: Prevent duplicate toast messages for resend ---
        if (data.otp) {
          toast.success(`Development OTP: ${data.otp}. Code resent to email.`); 
        } else {
          toast.success(data.message || "Verification code resent!");
        }
        // --- END FIX ---
        
        setResendTimer(60);
        // Clear current OTP inputs and focus the first one
        inputRefs.current.forEach(input => { if (input) input.value = ''; });
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      } else {
        toast.error(data.error || "Failed to resend verification code");
      }
    } catch (error) {
      const errorMessage = error.message.includes('Failed to fetch') 
        ? "Network error. Please check your connection." 
        : "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    
    const otp = inputRefs.current.map((el) => el?.value).join("");
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error("Please enter a valid 6-digit number");
      setOtpAutoSubmit(false);
      isAutoSubmittingRef.current = false;
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "OTP verified successfully");
        setVerifiedOtp(otp);
        setStep(3);
      } else {
        toast.error(data.error || "Invalid OTP");
        // Clear inputs on failure
        inputRefs.current.forEach(input => { if (input) input.value = ''; });
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      // Clear inputs on failure
      inputRefs.current.forEach(input => { if (input) input.value = ''; });
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
      setOtpAutoSubmit(false);
      isAutoSubmittingRef.current = false;
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
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: verifiedOtp,
          newPassword: password
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Password reset successful!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // More specific error handling based on likely backend messages
        let errorMessage = data.error || data.message || "Failed to reset password.";
        
        if (errorMessage.includes("same as your current")) {
            errorMessage = "New password cannot be the same as your old password. Choose a different password.";
        } else if (errorMessage.includes("OTP") || errorMessage.includes("expired")) {
            errorMessage = "OTP session has expired. Please request a new code.";
            setStep(2); // Move back to OTP step
            setVerifiedOtp("");
        }
        
        toast.error(errorMessage);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error("An unexpected error occurred during password reset.");
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      // Reset state based on step transition
      if (step === 2) {
        inputRefs.current.forEach(input => { if (input) input.value = ''; });
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

  // --- Render Logic ---

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute flex items-center text-gray-600 transition-colors left-5 sm:left-20 top-8 hover:text-gray-800"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      {/* Card */}
      <div className="w-full max-w-md p-8 text-center bg-white shadow-2xl rounded-2xl">
        
        {/* Step 1: Email input */}
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                <Key className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-800">Reset Password</h2>
              <p className="mb-6 text-sm text-gray-600">
                Enter your registered email address to receive a verification code.
              </p>
            </div>

            <form onSubmit={handleSendResetOtp}>
              <div className="relative flex items-center w-full px-5 py-3 mb-6 bg-gray-100 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full px-3 text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending Code..." : "Send Verification Code"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> An OTP will be sent to your email.
              </p>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              Remember your password?{" "}
              <span 
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
              >
                Sign In
              </span>
            </div>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-800">Verify Your Email</h2>
              <p className="mb-2 text-sm text-gray-600">
                Enter the 6-digit code sent to
              </p>
              <p className="mb-6 text-sm font-medium text-gray-800">{email}</p>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div
                className="flex justify-center mb-6 space-x-2 sm:space-x-3"
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
                      className="w-12 text-xl font-semibold text-center text-gray-800 transition-colors border border-gray-300 rounded-lg shadow-sm outline-none h-14 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading || otpAutoSubmit}
                    />
                  ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || otpAutoSubmit}
                className="w-full py-3 mb-4 font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || otpAutoSubmit ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <div className="space-y-4">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>OTP valid for 10 minutes</span>
              </div>

              <div className="text-sm text-gray-600">
                {otpAutoSubmit ? (
                  <span className="text-green-600">Verifying OTP...</span>
                ) : (
                  <>
                    Didn't receive the code?{" "}
                    {resendTimer > 0 ? (
                      <span className="text-gray-400">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <span 
                        className="text-blue-600 cursor-pointer hover:underline"
                        onClick={handleResendOtp}
                      >
                        Resend Code
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <>
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 mx-auto">
                <Lock className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-800">Create New Password</h2>
              <p className="mb-6 text-sm text-gray-600">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleResetPassword}>
              {/* New Password Input with Eye Toggle */}
              <div className="relative flex items-center w-full px-5 py-3 mb-4 bg-gray-100 rounded-lg">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password (min. 6 characters)"
                  className="w-full px-3 text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transition right-3 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Confirm Password Input with Eye Toggle */}
              <div className="relative flex items-center w-full px-5 py-3 mb-6 bg-gray-100 rounded-lg">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full px-3 text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-gray-400 transition right-3 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-sm text-yellow-800">
                Ensure your new password is secure and unique.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;