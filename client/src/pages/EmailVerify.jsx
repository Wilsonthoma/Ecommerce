import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

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
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-200 to-purple-400">
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="absolute cursor-pointer left-5 sm:left-20 top-5 w-28 sm:w-32"
      />

      {/* Verification Card */}
      <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl sm:p-8">
        <h2 className="mb-2 text-2xl font-semibold text-gray-800 sm:text-2xl">
          Verify Your Email
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Enter the 6-digit code sent to your email
        </p>

        <form onSubmit={onSubmitHandler}>
          {/* OTP Inputs - Responsive */}
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
                className="w-11 h-12 text-lg font-semibold text-center text-gray-800 transition-all border border-gray-300 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 sm:w-12 sm:h-14 sm:text-xl"
                disabled={isLoading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-medium text-white transition-all duration-300 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:py-3.5"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend Section */}
        <div className="mt-4 text-sm text-center text-gray-600">
          {resendTimer > 0 ? (
            <span className="text-gray-500">
              Resend code in {resendTimer}s
            </span>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-green-600 hover:text-green-700 hover:underline disabled:opacity-50"
            >
              Didn't receive the code? Resend
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;