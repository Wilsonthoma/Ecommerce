// src/components/auth/PasswordInput.jsx
import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { assets } from '../../assets/assets';

const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder = "Password", 
  disabled = false,
  showStrength = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    if (showStrength) {
      setStrength(getPasswordStrength(newValue));
    }
  };

  const strengthColors = {
    0: 'bg-red-500',
    1: 'bg-red-500',
    2: 'bg-yellow-500',
    3: 'bg-green-500',
    4: 'bg-green-500'
  };

  const strengthText = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong'
  };

  return (
    <div className="space-y-1">
      <div className="relative flex items-center w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800/95 focus-within:border-yellow-500/50">
        <img
          src={assets.lock_icon}
          alt="Password"
          className="w-4 h-4 opacity-70"
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="w-full px-2 text-xs text-white placeholder-gray-400 bg-transparent outline-none"
          value={value}
          onChange={handleChange}
          required
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute text-gray-400 transition cursor-pointer right-2 top-2 hover:text-yellow-500"
          disabled={disabled}
        >
          {showPassword ? <AiOutlineEyeInvisible size={16} /> : <AiOutlineEye size={16} />}
        </button>
      </div>
      
      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i}
                className={`h-1 flex-1 rounded-full ${i < strength ? strengthColors[strength] : 'bg-gray-700'}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-400">
            Strength: <span className={strength >= 2 ? 'text-green-500' : 'text-yellow-500'}>
              {strengthText[strength]}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;