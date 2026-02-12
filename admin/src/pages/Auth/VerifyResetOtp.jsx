import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, Clock } from 'lucide-react';

const VerifyResetOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit when all digits are filled
    if (index === 5 && value && newOtp.every(digit => digit)) {
      handleVerifyOtp();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) {
      toast.error('Only numbers are allowed');
      return;
    }

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otp];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
        if (inputRefs.current[index]) {
          inputRefs.current[index].value = digit;
        }
      }
    });
    
    setOtp(newOtp);
    
    // Focus last filled input
    const lastIndex = Math.min(digits.length - 1, 5);
    if (inputRefs.current[lastIndex]) {
      inputRefs.current[lastIndex].focus();
    }

    // Auto-submit if all digits are pasted
    if (digits.length === 6) {
      setTimeout(() => handleVerifyOtp(), 100);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    if (!email) {
      toast.error('Email not found. Please start over.');
      navigate('/forgot-password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/admin/auth/verify-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: otpString 
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('OTP verified successfully');
        // Navigate to reset password page with email and OTP
        navigate('/reset-password', { 
          state: { 
            email, 
            otp: otpString,
            verificationToken: data.verificationToken 
          } 
        });
      } else {
        toast.error(data.error || 'Invalid OTP');
        // Clear OTP
        setOtp(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds before resending`);
      return;
    }

    if (!email) {
      toast.error('Email not found');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/admin/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('New OTP sent to your email');
        setResendTimer(60);
        
        // In development, show OTP
        if (data.otp) {
          toast.success(`Development OTP: ${data.otp}`);
        }
        
        // Clear current OTP
        setOtp(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        toast.error(data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <button
            onClick={() => navigate('/forgot-password')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
            <p className="text-gray-600 mt-2">
              Enter the 6-digit code sent to
            </p>
            <p className="text-sm font-medium text-gray-800 mt-1">{email}</p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                6-Digit Verification Code
              </label>
              <div 
                className="flex justify-center space-x-2 sm:space-x-3"
                onPaste={handlePaste}
              >
                {Array(6).fill(0).map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={otp[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-xl font-semibold text-center text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>OTP valid for 10 minutes</span>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetOtp;