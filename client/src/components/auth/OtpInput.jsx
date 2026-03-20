// src/components/auth/OtpInput.jsx
import React, { useRef, useEffect } from 'react';

const OtpInput = ({ 
  length = 6, 
  onComplete, 
  disabled = false,
  autoFocus = true
}) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleInput = (e, index) => {
    const value = e.target.value;
    
    if (!/^\d*$/.test(value)) {
      e.target.value = '';
      return;
    }

    if (value.length > 0 && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Check if all inputs are filled
    const allFilled = inputRefs.current.every(input => input && input.value.length > 0);
    if (allFilled && onComplete) {
      const otp = inputRefs.current.map(el => el.value).join('');
      onComplete(otp);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (!/^[0-9]+$/.test(pastedData)) {
      return;
    }

    const digits = pastedData.slice(0, length).split("");
    
    digits.forEach((digit, i) => {
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = digit;
      }
    });

    const lastFilled = Math.min(digits.length, length) - 1;
    if (lastFilled >= 0 && inputRefs.current[lastFilled]) {
      inputRefs.current[lastFilled].focus();
    }

    // Auto-submit if all filled
    if (digits.length === length && onComplete) {
      const otp = digits.join('');
      onComplete(otp);
    }
  };

  return (
    <div
      className="flex justify-center gap-1 sm:gap-2"
      onPaste={handlePaste}
    >
      {Array(length).fill(0).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          ref={(el) => (inputRefs.current[index] = el)}
          onInput={(e) => handleInput(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-10 h-12 text-sm font-semibold text-center text-white border border-gray-700 rounded-lg bg-gray-800/95 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 sm:w-12 sm:h-14 sm:text-lg"
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
        />
      ))}
    </div>
  );
};

export default OtpInput;