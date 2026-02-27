// src/pages/Login.jsx - FIXED non-scrolling, centered, X removed
import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import clientApi from "../services/client/api";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";

// Font styles - UPDATED with yellow-orange theme
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
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
  
  /* COMPACT TEXT SIZES */
  .text-2xl {
    font-size: 1.2rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }
  
  .text-xs {
    font-size: 0.65rem;
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
    transform: translateZ(15px);
  }
`;

// Login background image
const loginBackgroundImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for bottom transition - UPDATED to yellow-orange
const bottomGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

const Login = () => {
  const [state, setState] = useState("Login");
  const navigate = useNavigate();
  const location = useLocation();
  
  const context = useContext(AppContext);
  const getUserData = context?.getUserData || (async () => {});
  const isLoggedIn = context?.isLoggedIn || false;

  const from = location.state?.from || '/dashboard';
  
  console.log('📍 Will redirect to after login:', from);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const [rememberMe, setRememberMe] = useState(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    return !!savedEmail;
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail && state === "Login") {
      setEmail(savedEmail);
    }
  }, [state]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (isLoggedIn && !window.location.search) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, navigate, from]);

  // Google OAuth handler
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      sessionStorage.setItem('redirectAfterLogin', from);
      console.log('📍 Initiating Google login, redirect to:', from);
      
      const response = await clientApi.get('/auth/google');
      
      if (response.data.success && response.data.authUrl) {
        console.log('📍 Redirecting to Google auth URL');
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

  // Submit handler using clientApi
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const url = state === "Sign Up" ? '/auth/register' : '/auth/login';

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

      const response = await clientApi.post(url, payload);

      if (response.data.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email.toLowerCase().trim());
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        if (response.data.token) {
          if (rememberMe) {
            localStorage.setItem('token', response.data.token);
          } else {
            sessionStorage.setItem('token', response.data.token);
          }
          clientApi.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }

        if (response.data.user) {
          const userData = response.data.user;
          if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            sessionStorage.setItem('user', JSON.stringify(userData));
          }
        }

        if (state === "Login") {
          toast.success("Logged in successfully!");
          await getUserData();
          console.log('📍 Redirecting to:', from);
          navigate(from, { replace: true });
        } else {
          toast.success("Account created successfully!");
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
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Full-page Background Image - fixed covering entire viewport */}
      <div className="absolute inset-0">
        <img 
          src={loginBackgroundImage}
          alt="Background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className={`absolute inset-0 bg-gradient-to-t ${bottomGradient} mix-blend-overlay`}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      {/* Logo/Brand at top left - COMPACT */}
      <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white transition-all border border-gray-700 rounded-full bg-black/50 backdrop-blur-sm hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
        >
          <span className="text-yellow-500">←</span> Back to Home
        </button>
      </div>

      {/* Centered Login Card - perfectly centered, no scrolling */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-sm px-4">
          <div className="relative p-6 text-center border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm card-3d">
            {/* X button REMOVED as requested */}

            <h2 className="mb-1 text-xl font-semibold text-white">
              {state === "Sign Up" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mb-4 text-xs text-gray-400">
              {state === "Sign Up"
                ? "Create your account to get started"
                : "Login to your account to continue"}
            </p>

            {/* Google OAuth Button - COMPACT */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="flex items-center justify-center w-full gap-2 px-3 py-2.5 mb-3 text-xs font-medium text-white transition-all duration-300 border border-gray-700 rounded-full bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700 hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-yellow-500 focus:ring-offset-gray-900"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 rounded-full border-t-yellow-500 animate-spin"></div>
              ) : (
                <FcGoogle className="w-4 h-4" />
              )}
              <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
            </button>

            {/* Divider - COMPACT */}
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 text-gray-400 bg-gray-900/95">or</span>
              </div>
            </div>

            <form className="flex flex-col gap-3" onSubmit={onSubmitHandler}>
              {state === "Sign Up" && (
                <div className="flex items-center w-full px-4 py-2.5 border border-gray-700 rounded-full bg-gray-800/95 backdrop-blur-sm focus-within:border-yellow-500/50 focus-within:ring-1 focus-within:ring-yellow-500/50">
                  <img src={assets.person_icon} alt="User" className="w-4 h-4 opacity-70" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength="2"
                    maxLength="50"
                    className="w-full px-2 text-sm text-white placeholder-gray-400 bg-transparent outline-none"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="flex items-center w-full px-4 py-2.5 border border-gray-700 rounded-full bg-gray-800/95 backdrop-blur-sm focus-within:border-yellow-500/50 focus-within:ring-1 focus-within:ring-yellow-500/50">
                <img src={assets.mail_icon} alt="Email" className="w-4 h-4 opacity-70" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-2 text-sm text-white placeholder-gray-400 bg-transparent outline-none"
                  disabled={isLoading}
                />
              </div>

              <div className="relative flex items-center w-full px-4 py-2.5 border border-gray-700 rounded-full bg-gray-800/95 backdrop-blur-sm focus-within:border-yellow-500/50 focus-within:ring-1 focus-within:ring-yellow-500/50">
                <img src={assets.lock_icon} alt="Password" className="w-4 h-4 opacity-70" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={state === "Sign Up" ? "6" : "1"}
                  className="w-full px-2 text-sm text-white placeholder-gray-400 bg-transparent outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transition cursor-pointer right-3 top-2.5 hover:text-yellow-500"
                  disabled={isLoading}
                >
                  {showPassword ? <AiOutlineEyeInvisible size={16} /> : <AiOutlineEye size={16} />}
                </button>
              </div>

              {state === "Login" && (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-yellow-600 bg-gray-800 border-gray-700 rounded focus:ring-yellow-500 focus:ring-offset-0"
                    />
                    <span className="ml-1.5 text-xs text-gray-400">Remember me</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => navigate("/reset-password")}
                    className="text-xs text-yellow-500 hover:text-yellow-400 hover:underline"
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="relative w-full py-2.5 mt-1 overflow-hidden text-sm font-medium text-white transition-all rounded-full group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl group-hover:opacity-100"></span>
                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <div className="w-3.5 h-3.5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      <span className="text-xs">{state === "Sign Up" ? "Creating..." : "Logging in..."}</span>
                    </span>
                  ) : state === "Sign Up" ? "Sign Up" : "Login"}
                </span>
              </button>
            </form>

            <p className="mt-3 text-xs text-gray-400">
              {state === "Sign Up" ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setState("Login");
                      setName("");
                      setEmail(localStorage.getItem('rememberedEmail') || "");
                      setPassword("");
                    }}
                    className="text-yellow-500 hover:text-yellow-400 hover:underline"
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
                    className="text-yellow-500 hover:text-yellow-400 hover:underline"
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