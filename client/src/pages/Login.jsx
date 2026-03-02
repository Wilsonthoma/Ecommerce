// src/pages/Login.jsx - FIXED Google OAuth
import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import clientApi from "../services/client/api";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";

// Login background image
const loginBackgroundImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for overlay
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    if (isLoggedIn && !window.location.search) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, navigate, from]);

  // FIXED Google OAuth handler
  const handleGoogleLogin = async () => {
    try {
      // Save redirect location
      sessionStorage.setItem('redirectAfterLogin', from);
      console.log('📍 Initiating Google login, redirect to:', from);
      
      toast.info("Connecting to Google...", { autoClose: 2000 });
      
      // Get auth URL from backend
      const response = await clientApi.get('/auth/google');
      console.log('📍 Google auth response:', response.data);
      
      if (response.data?.authUrl) {
        console.log('📍 Redirecting to:', response.data.authUrl);
        
        // IMPORTANT: This redirects the browser to Google
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to connect to Google. Please try again.');
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

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
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

      <div className="absolute z-20 top-4 left-4">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white transition-all border border-gray-700 rounded-full bg-black/50 backdrop-blur-sm hover:border-yellow-500/50"
        >
          <span className="text-yellow-500">←</span> Back
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-[300px] px-3">
          <div className="relative p-5 text-center border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm">
            
            <div className="flex justify-center mb-3">
              <img 
                src={assets.logo} 
                alt="KwetuShop" 
                className="w-auto h-8 sm:h-9" 
              />
            </div>

            <h2 className="mb-1 text-base font-semibold text-white">
              {state === "Sign Up" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mb-4 text-xs text-gray-400">
              {state === "Sign Up" ? "Sign up to get started" : "Login to your account"}
            </p>

            {/* Google Button - FIXED */}
            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="flex items-center justify-center w-full gap-2 px-3 py-2 mb-3 text-xs font-medium text-white transition-all border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700 hover:border-yellow-500/50 disabled:opacity-50"
            >
              <FcGoogle className="w-4 h-4" />
              <span>Continue with Google</span>
            </button>

            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 text-gray-400 bg-gray-900/95">or</span>
              </div>
            </div>

            <form className="flex flex-col gap-2" onSubmit={onSubmitHandler}>
              {state === "Sign Up" && (
                <div className="flex items-center w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800/95 focus-within:border-yellow-500/50">
                  <img src={assets.person_icon} alt="User" className="w-4 h-4 opacity-70" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-2 text-xs text-white placeholder-gray-400 bg-transparent outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="flex items-center w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800/95 focus-within:border-yellow-500/50">
                <img src={assets.mail_icon} alt="Email" className="w-4 h-4 opacity-70" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-2 text-xs text-white placeholder-gray-400 bg-transparent outline-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="relative flex items-center w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800/95 focus-within:border-yellow-500/50">
                <img src={assets.lock_icon} alt="Password" className="w-4 h-4 opacity-70" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-2 text-xs text-white placeholder-gray-400 bg-transparent outline-none"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transition cursor-pointer right-2 top-2 hover:text-yellow-500"
                  disabled={isSubmitting}
                >
                  {showPassword ? <AiOutlineEyeInvisible size={16} /> : <AiOutlineEye size={16} />}
                </button>
              </div>

              {state === "Login" && (
                <div className="flex items-center justify-between px-1 mt-1">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3 h-3 text-yellow-600 bg-gray-800 border-gray-700 rounded"
                    />
                    <span className="ml-1 text-xs text-gray-400">Remember me</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => navigate("/reset-password")}
                    className="text-xs text-yellow-500 hover:text-yellow-400"
                    disabled={isSubmitting}
                  >
                    Forgot?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full py-2 mt-2 overflow-hidden text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:shadow-lg hover:shadow-orange-600/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    <span>{state === "Sign Up" ? "Creating..." : "Logging in..."}</span>
                  </span>
                ) : (
                  state === "Sign Up" ? "Sign Up" : "Sign In"
                )}
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
                    className="font-medium text-yellow-500 hover:text-yellow-400"
                    disabled={isSubmitting}
                  >
                    Sign In
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
                    className="font-medium text-yellow-500 hover:text-yellow-400"
                    disabled={isSubmitting}
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