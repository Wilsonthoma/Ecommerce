// src/pages/Login.jsx - Add back arrow
import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import clientApi from "../services/client/api";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import AuthLayout from "../components/auth/AuthLayout";
import AuthForm from "../components/auth/AuthForm";
import PasswordInput from "../components/auth/PasswordInput";
import SocialLoginButtons from "../components/auth/SocialLoginButtons";
import { IoArrowBack } from "react-icons/io5"; // Add this import

// Background image
const loginBackgroundImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";
const bottomGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

const Login = () => {
  const [state, setState] = useState("Login");
  const navigate = useNavigate();
  const location = useLocation();
  
  const context = useContext(AppContext);
  const getUserData = context?.getUserData || (async () => {});
  const isLoggedIn = context?.isLoggedIn || false;

  const from = location.state?.from || '/dashboard';
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  // Only check once on mount to prevent flash
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && isLoggedIn) {
      console.log('📍 Already logged in, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      sessionStorage.setItem('redirectAfterLogin', from);
      
      const response = await clientApi.get('/auth/google');
      
      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to connect to Google. Please try again.');
      setGoogleLoading(false);
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

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const url = state === "Sign Up" ? '/auth/register' : '/auth/login';

      const payload = state === "Sign Up"
        ? { name: name.trim(), email: email.toLowerCase().trim(), password }
        : { email: email.toLowerCase().trim(), password };

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
    <AuthLayout backgroundImage={loginBackgroundImage} gradient={bottomGradient}>
      {/* Back Arrow Button - Added */}
      <div className="absolute z-30 top-4 left-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white transition-all border border-gray-700 rounded-full bg-black/50 backdrop-blur-sm hover:border-yellow-500/50 hover:bg-black/70"
        >
          <IoArrowBack className="w-3.5 h-3.5 text-yellow-500" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-[360px] px-4">
          <div className="relative p-6 border border-gray-800 rounded-2xl bg-gray-900/95 backdrop-blur-sm">
            
            {/* Logo inside card */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute rounded-full -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 opacity-30 blur-xl"></div>
                <img 
                  src={assets.logo} 
                  alt="KwetuShop" 
                  className="relative w-auto h-12"
                />
              </div>
            </div>

            <h2 className="mb-4 text-lg font-bold text-center text-white">
              {state === "Sign Up" ? "Create Account" : "Welcome Back"}
            </h2>

            <SocialLoginButtons 
              onGoogleClick={handleGoogleLogin}
              loading={googleLoading}
              disabled={isSubmitting}
            />

            <AuthForm
              onSubmit={onSubmitHandler}
              isLoading={isSubmitting}
              buttonText={state === "Sign Up" ? "Sign Up" : "Sign In"}
              loadingText={state === "Sign Up" ? "Creating..." : "Logging in..."}
            >
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

              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isSubmitting}
              />

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
            </AuthForm>

            <div className="mt-4 text-xs text-center text-gray-400">
              {state === "Sign Up" ? (
                <p>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setState("Login");
                      setName("");
                      setEmail(localStorage.getItem('rememberedEmail') || "");
                      setPassword("");
                    }}
                    className="font-medium text-yellow-500 hover:text-yellow-400"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setState("Sign Up");
                      setName("");
                      setEmail("");
                      setPassword("");
                    }}
                    className="font-medium text-yellow-500 hover:text-yellow-400"
                  >
                    Sign Up
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;