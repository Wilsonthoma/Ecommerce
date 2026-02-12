// src/pages/Login.jsx
import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [state, setState] = useState("Login");
  const navigate = useNavigate();
  const { backendUrl, getUserData } = useContext(AppContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Set CSRF token on mount
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

  // Google OAuth handler
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/auth/google`, {
        withCredentials: true,
      });
      
      if (response.data.success && response.data.authUrl) {
        window.location.href = response.data.authUrl;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to initiate Google login. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // ==================== FIXED: OAUTH CALLBACK HANDLER - SINGLE TOAST ====================
  useEffect(() => {
    const checkOAuthStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get("error");
      const loginStatus = urlParams.get("login");
      const source = urlParams.get("source");

      if (error) {
        const errorMessages = {
          oauth_failed: "Google login failed. Please try again.",
          no_code: "Authentication incomplete. Please try again.",
          user_cancelled: "Login cancelled.",
          invalid_state: "Security validation failed. Please try again.",
          token_expired: "Authentication session expired. Please try again.",
          auth_failed: "Authentication failed. Please try again."
        };
        toast.error(errorMessages[error] || "Authentication failed");
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // ✅ ONLY show toast for successful OAuth login
      if (loginStatus === "success") {
        toast.success(
          source === "google"
            ? "Logged in successfully with Google! 🎉"
            : "Logged in successfully! 🎉"
        );
        
        try {
          await getUserData();
          navigate("/");
        } catch (err) {
          console.error("Failed to get user data after OAuth:", err);
        }
        
        // Clean URL after navigation
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkOAuthStatus();
  }, [getUserData, navigate]);

  // Form validation
  const validateForm = () => {
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (state === "Sign Up") {
      if (!name) {
        toast.error("Please enter your name");
        return false;
      }
      if (name.length < 2) {
        toast.error("Name must be at least 2 characters");
        return false;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return false;
      }
    }

    return true;
  };

  // Submit handler
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const url = state === "Sign Up" 
        ? `${backendUrl}/api/auth/register`
        : `${backendUrl}/api/auth/login`;

      const payload = state === "Sign Up"
        ? {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
          }
        : {
            email: email.toLowerCase().trim(),
            password,
          };

      const response = await axios.post(url, payload, {
        withCredentials: true,
      });

      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }

        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        // ✅ Show toast for email/password auth
        toast.success(response.data.message || (
          state === "Sign Up" 
            ? "Account created successfully!" 
            : "Logged in successfully!"
        ));

        if (state === "Login") {
          await getUserData();
          navigate("/");
        } else {
          setState("Login");
          setName("");
          setEmail("");
          setPassword("");
          toast.info("Please log in with your new credentials");
        }
      }
    } catch (error) {
      console.error("Auth Error:", error);
      
      let errorMessage = "Authentication failed. Please try again.";
      
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        
        if (msg.includes("Google")) {
          errorMessage = "This email is registered with Google. Please sign in with Google.";
        } else if (msg.includes("already exists")) {
          errorMessage = "Email already registered. Please login instead.";
          setState("Login");
        } else if (msg.includes("Invalid email or password")) {
          errorMessage = "The email or password you entered is incorrect.";
        } else if (msg.includes("not found")) {
          errorMessage = "No account found with this email address.";
        } else {
          errorMessage = msg;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="absolute cursor-pointer left-5 sm:left-20 top-5 w-28 sm:w-32"
      />

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute px-4 py-2 text-gray-600 transition-colors bg-white border border-gray-300 rounded-full right-5 sm:right-20 top-5 hover:bg-gray-50"
      >
        ← Back to Home
      </button>

      {/* Auth Container */}
      <div className="w-full max-w-md p-8 text-center bg-white shadow-2xl rounded-2xl">
        <h2 className="mb-2 text-2xl font-semibold text-gray-800">
          {state === "Sign Up" ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          {state === "Sign Up"
            ? "Create your account to get started"
            : "Login to your account to continue"}
        </p>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          className="flex items-center justify-center w-full gap-3 px-4 py-3 mb-4 font-medium text-gray-700 transition-all duration-300 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isGoogleLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full border-t-blue-500 animate-spin"></div>
          ) : (
            <FcGoogle className="w-5 h-5" />
          )}
          <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
        </button>

        {/* Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">or continue with email</span>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="flex items-center w-full px-5 py-3 bg-gray-100 rounded-full">
              <img src={assets.person_icon} alt="User" className="w-5 h-5 opacity-70" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength="2"
                maxLength="50"
                className="w-full px-3 text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex items-center w-full px-5 py-3 bg-gray-100 rounded-full">
            <img src={assets.mail_icon} alt="Email" className="w-5 h-5 opacity-70" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 text-gray-800 placeholder-gray-400 bg-transparent outline-none"
              disabled={isLoading}
            />
          </div>

          <div className="relative flex items-center w-full px-5 py-3 bg-gray-100 rounded-full">
            <img src={assets.lock_icon} alt="Password" className="w-5 h-5 opacity-70" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={state === "Sign Up" ? "6" : "1"}
              className="w-full px-3 text-gray-800 placeholder-gray-400 bg-transparent outline-none"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-gray-400 transition cursor-pointer right-3 top-3 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>

          {state === "Login" && (
            <div className="-mt-2 text-right">
              <button
                type="button"
                onClick={() => navigate("/reset-password")}
                className="text-sm text-green-600 hover:text-green-700 hover:underline"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full py-3 font-medium text-white transition-all duration-300 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                {state === "Sign Up" ? "Creating Account..." : "Logging In..."}
              </span>
            ) : state === "Sign Up" ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          {state === "Sign Up" ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setState("Login");
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-green-600 hover:underline"
                disabled={isLoading}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setState("Sign Up");
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-green-600 hover:underline"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;