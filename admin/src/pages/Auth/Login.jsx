import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Shield, Home } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Lockout timer
  useEffect(() => {
    if (attemptCount >= 5) {
      setIsRateLimited(true);
      const timer = setTimeout(() => {
        setIsRateLimited(false);
        setAttemptCount(0);
      }, 300000);
      return () => clearTimeout(timer);
    }
  }, [attemptCount]);

  const validateEmail = useCallback((email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, validateEmail]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [formErrors]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRateLimited) {
      toast.error('Too many attempts. Try again in 5 minutes.');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await login(formData.email.trim(), formData.password);

      if (result.success) {
        setAttemptCount(0);

        // --- FIX IMPLEMENTED HERE ---
        // We now rely ONLY on the message returned by the login function (from the backend/AuthContext)
        // This eliminates the redundant 'Login successful! Redirecting...' toast.
        
        // Use the returned message if available, otherwise use a generic one.
        // NOTE: If your AuthContext already shows a toast, you can remove this entire block.
        const successMessage = result.message || 'Login successful! Redirecting...';
        toast.success(successMessage);
        
        // --- END FIX ---

        navigate(from, { replace: true });
      } else {
        setAttemptCount((prev) => prev + 1);

        let errorMessage = result.error || 'Invalid credentials.';

        if (result.error?.includes('locked')) {
          errorMessage = 'Your account is locked. Try again later.';
        } else if (result.error?.includes('deactivated')) {
          errorMessage = 'Account disabled. Contact administrator.';
        } else if (result.error?.includes('Email not verified')) {
          errorMessage = 'Verify your email before logging in.';
        }

        toast.error(errorMessage);
        setFormData((prev) => ({ ...prev, password: '' }));
      }
    } catch (err) {
      console.error(err);
      setAttemptCount((prev) => prev + 1);

      if (!err.response) {
        toast.error('Network error. Check your connection.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }

      setFormData((prev) => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password', {
      state: validateEmail(formData.email) ? { email: formData.email } : {}
    });
  };

  const RateLimitWarning = () => (
    <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6">
      <div className="flex items-start">
        <Shield className="w-5 h-5 text-red-500 mr-3 mt-1" />
        <p className="text-sm text-red-700">
          <strong>Too Many Attempts</strong><br />
          Please wait 5 minutes before trying again.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Admin Portal</h1>
                <p className="text-blue-100 text-sm">Secure Access Dashboard</p>
              </div>
            </div>

            <button
              onClick={() => window.open('/', '_blank')}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              disabled={loading || isRateLimited}
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {isRateLimited && <RateLimitWarning />}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="admin@example.com"
                  disabled={loading || isRateLimited}
                />
              </div>

              {formErrors.email && (
                <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  disabled={loading || isRateLimited}
                />

                {/* Show Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {formErrors.password && (
                <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isRateLimited}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="border-t" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 px-3 bg-white text-gray-500 text-sm">
              or
            </div>
          </div>

          {/* Setup */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-4">New to the system?</p>
            <Link
              to="/setup"
              className="inline-flex items-center justify-center w-full py-2.5 border rounded-lg"
            >
              <Shield className="w-5 h-5 mr-2" /> Setup Admin System
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Login);