// src/pages/EmailVerify.jsx - Refactored with reusable components
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { BsLightningCharge, BsArrowRight } from "react-icons/bs";
import { FiMail } from "react-icons/fi";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import OtpInput from "../components/auth/OtpInput";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Background image
const emailVerifyBackgroundImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";
const bottomGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

const EmailVerify = () => {
  const navigate = useNavigate();
  const { backendUrl, getUserData } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);

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

  // Page loading
  useEffect(() => {
    setTimeout(() => {
      setPageLoading(false);
    }, 500);
  }, []);

  // Verify OTP
  const handleVerifyOtp = async (otp) => {
    if (!otp || otp.length !== 6) {
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
          <img src={emailVerifyBackgroundImage} alt="Background" className="object-cover w-full h-full" />
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
    <AuthLayout backgroundImage={emailVerifyBackgroundImage} gradient={bottomGradient}>
      <AuthHeader showBackButton={true} />

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="relative card-3d">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl opacity-30 blur-xl"></div>
            
            <div className="relative p-6 border border-gray-800 rounded-2xl bg-gray-900/95 backdrop-blur-sm sm:p-8 card-3d-content">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                    <FiMail className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full opacity-50 blur-xl"></div>
                </div>
              </div>

              <h2 className="mb-2 text-2xl font-bold text-center text-white">Verify Your Email</h2>
              <p className="mb-6 text-sm text-center text-gray-400">Enter the 6-digit code sent to your email</p>

              <OtpInput
                length={6}
                onComplete={handleVerifyOtp}
                disabled={isLoading}
                autoFocus={true}
              />

              <div className="mt-4 text-sm text-center">
                {resendTimer > 0 ? (
                  <span className="text-gray-500">Resend code in {resendTimer}s</span>
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

              <div className="flex items-center gap-2 p-3 mt-4 text-xs border rounded-lg bg-yellow-600/10 border-yellow-600/20">
                <BsLightningCharge className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-400">Never share your verification code</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailVerify;