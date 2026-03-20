// src/pages/ResetPassword.jsx - Refactored with reusable components
import React, { useState, useRef, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { IoArrowBack } from "react-icons/io5";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import AuthForm from "../components/auth/AuthForm";
import PasswordInput from "../components/auth/PasswordInput";
import OtpInput from "../components/auth/OtpInput";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Background image
const resetBackgroundImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";
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
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPageLoading(false);
    }, 500);
  }, []);

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle OTP verification
  const handleVerifyOtp = useCallback(async (otp) => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    try {
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

      if (data.success) {
        toast.success(data.message || "OTP verified successfully");
        setVerifiedOtp(otp);
        setStep(3);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      
      if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
        try {
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
          if (retryData.data.success) {
            toast.success("OTP verified successfully");
            setVerifiedOtp(otp);
            setStep(3);
            return;
          }
        } catch (retryError) {
          console.error("Retry failed:", retryError);
        }
      }
      
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [email, backendUrl, refreshCsrfToken]);

  // Send reset OTP
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
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

      if (data.success) {
        toast.success(data.message || "Verification code sent to your email!");
        setStep(2);
        setResendTimer(60);
      } else {
        toast.error(data.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Send OTP Error:", error);
      
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
            toast.success("Verification code sent!");
            setStep(2);
            setResendTimer(60);
            return;
          }
        } catch (retryError) {
          console.error("Retry failed:", retryError);
        }
      }
      
      toast.error(error.response?.data?.message || "Failed to send verification code");
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

      if (data.success) {
        toast.success(data.message || "Verification code resent!");
        setResendTimer(60);
      } else {
        toast.error(data.message || "Failed to resend verification code");
      }
    } catch (error) {
      console.error("Resend OTP Error:", error);
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
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
      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        { email, otp: verifiedOtp, newPassword: password },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
          },
        }
      );

      if (data.success) {
        toast.success(data.message || "Password reset successful!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Password Reset Error:", error);
      
      if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
        try {
          await refreshCsrfToken();
          const retryData = await axios.post(
            `${backendUrl}/api/auth/reset-password`,
            { email, otp: verifiedOtp, newPassword: password },
            {
              withCredentials: true,
              headers: {
                "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
              },
            }
          );
          if (retryData.data.success) {
            toast.success("Password reset successful!");
            setTimeout(() => navigate("/login"), 2000);
            return;
          }
        } catch (retryError) {
          console.error("Retry failed:", retryError);
        }
      }
      
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 3) {
        setPassword("");
        setConfirmPassword("");
      }
    } else {
      navigate("/login");
    }
  };

  // Page loading state
  if (pageLoading) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img src={resetBackgroundImage} alt="Background" className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${bottomGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner message="Loading reset password..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <AuthLayout backgroundImage={resetBackgroundImage} gradient={bottomGradient}>
      <AuthHeader showBackButton={true} />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[320px] px-3">
          <div className="relative p-5 text-center border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm">
            <button
              onClick={handleBack}
              className="absolute p-1.5 transition-all border border-gray-700 rounded-full -left-2 -top-2 bg-gray-900 hover:border-yellow-500/50 hover:bg-gray-800"
            >
              <IoArrowBack className="w-3.5 h-3.5 text-gray-400 transition-colors hover:text-yellow-500" />
            </button>

            {step === 1 && (
              <>
                <h2 className="mb-1 text-base font-semibold text-white">Reset Password</h2>
                <p className="mb-4 text-xs text-gray-400">Enter your registered email to receive a verification code</p>

                <form onSubmit={handleSendResetOtp}>
                  <div className="flex items-center w-full px-3 py-2 mb-3 border border-gray-700 rounded-lg bg-gray-800/95 focus-within:border-yellow-500/50">
                    <img src={assets.mail_icon} alt="Mail" className="w-4 h-4 opacity-70" />
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

                  <AuthForm
                    onSubmit={handleSendResetOtp}
                    isLoading={isLoading}
                    buttonText="Send Code"
                    loadingText="Sending..."
                  />
                </form>

                <p className="mt-3 text-xs text-gray-400">
                  Remember your password?{" "}
                  <span className="font-medium text-yellow-500 cursor-pointer hover:text-yellow-400" onClick={() => navigate("/login")}>
                    Sign In
                  </span>
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="mb-1 text-base font-semibold text-white">Verify Email</h2>
                <p className="mb-1 text-xs text-gray-400">Enter the 6-digit code sent to</p>
                <p className="mb-4 text-xs font-medium text-yellow-500 break-all">{email}</p>

                <OtpInput
                  length={6}
                  onComplete={handleVerifyOtp}
                  disabled={isLoading}
                  autoFocus={true}
                />

                <div className="mt-4 text-xs text-center">
                  {resendTimer > 0 ? (
                    <span className="text-gray-500">Resend in {resendTimer}s</span>
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
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="mb-1 text-base font-semibold text-white">New Password</h2>
                <p className="mb-4 text-xs text-gray-400">Create a strong password</p>

                <form onSubmit={handleResetPassword}>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    disabled={isLoading}
                    showStrength={true}
                  />
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    disabled={isLoading}
                  />

                  <AuthForm
                    onSubmit={handleResetPassword}
                    isLoading={isLoading}
                    buttonText="Reset Password"
                    loadingText="Resetting..."
                  />
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;