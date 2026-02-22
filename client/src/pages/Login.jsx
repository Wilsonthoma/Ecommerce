// src/pages/Login.jsx - UPDATED with centered card, full-page background, and no scrolling
import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { FiMapPin } from "react-icons/fi";

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
    text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  }
`;

// Animation styles
const animationStyles = `
  @keyframes gradient {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0.1; }
  }
  
  .animate-gradient {
    animation: gradient 8s ease-in-out infinite;
  }
  
  .card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .card-3d-content {
    transform: translateZ(20px);
  }
`;

// Login background image
const loginBackgroundImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for bottom transition - indigo/blue/cyan
const bottomGradient = "from-indigo-600/20 via-blue-600/20 to-cyan-600/20";

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

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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

  // OAuth callback handler
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
    <div className="relative h-screen overflow-hidden bg-black">
      {/* Full-page Background Image */}
      <div className="absolute inset-0">
        <img 
          src={loginBackgroundImage}
          alt="Background"
          className="object-cover w-full h-full"
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Bottom gradient - indigo/blue/cyan */}
        <div className={`absolute inset-0 bg-gradient-to-t ${bottomGradient} mix-blend-overlay`}></div>
        {/* Final black gradient at the very bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      {/* Top Bar - with semi-transparent background */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <TopBar />
      </div>

      {/* Centered Login Card - No scrolling */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          {/* Auth Container */}
          <div className="relative p-8 text-center border border-gray-800 rounded-2xl bg-gray-900/95 backdrop-blur-sm card-3d">
            {/* Styled Close Button - Top Right Corner */}
            <button
              onClick={() => navigate("/")}
              className="absolute p-2 transition-all duration-300 border border-gray-700 rounded-full shadow-lg -top-3 -right-3 bg-gray-900/95 backdrop-blur-sm hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
              aria-label="Close"
            >
              <IoClose className="w-5 h-5 text-gray-400 transition-colors duration-300 group-hover:text-white" />
            </button>

            <h2 className="mb-2 text-2xl font-semibold text-white">
              {state === "Sign Up" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mb-6 text-sm text-gray-400">
              {state === "Sign Up"
                ? "Create your account to get started"
                : "Login to your account to continue"}
            </p>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="flex items-center justify-center w-full gap-3 px-4 py-3 mb-4 font-medium text-white transition-all duration-300 border border-gray-700 rounded-full bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 rounded-full border-t-indigo-500 animate-spin"></div>
              ) : (
                <FcGoogle className="w-5 h-5" />
              )}
              <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
            </button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-400 bg-gray-900/95">or continue with email</span>
              </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={onSubmitHandler}>
              {state === "Sign Up" && (
                <div className="flex items-center w-full px-5 py-3 border border-gray-700 rounded-full bg-gray-800/95 backdrop-blur-sm focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50">
                  <img src={assets.person_icon} alt="User" className="w-5 h-5 opacity-70" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength="2"
                    maxLength="50"
                    className="w-full px-3 text-white placeholder-gray-400 bg-transparent outline-none"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="flex items-center w-full px-5 py-3 border border-gray-700 rounded-full bg-gray-800/95 backdrop-blur-sm focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50">
                <img src={assets.mail_icon} alt="Email" className="w-5 h-5 opacity-70" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 text-white placeholder-gray-400 bg-transparent outline-none"
                  disabled={isLoading}
                />
              </div>

              <div className="relative flex items-center w-full px-5 py-3 border border-gray-700 rounded-full bg-gray-800/95 backdrop-blur-sm focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50">
                <img src={assets.lock_icon} alt="Password" className="w-5 h-5 opacity-70" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={state === "Sign Up" ? "6" : "1"}
                  className="w-full px-3 text-white placeholder-gray-400 bg-transparent outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transition cursor-pointer right-3 top-3 hover:text-indigo-500"
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
                    className="text-sm text-indigo-500 hover:text-indigo-400 hover:underline"
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="relative w-full py-3 mt-2 overflow-hidden text-sm font-medium text-white transition-all rounded-full group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
                <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      {state === "Sign Up" ? "Creating Account..." : "Logging In..."}
                    </span>
                  ) : state === "Sign Up" ? "Sign Up" : "Login"}
                </span>
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-400">
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
                    className="text-indigo-500 hover:text-indigo-400 hover:underline"
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
                    className="text-indigo-500 hover:text-indigo-400 hover:underline"
                    disabled={isLoading}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;