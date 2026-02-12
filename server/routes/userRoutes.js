import express from "express";
import {
    register,
    login,
    logout,
    sendVerifyOtp,
    verifyEmail,
    isAuthenticated,
    sendResetOtp,
    verifyResetOtp,
    resetPassword,
    googleAuth,
    googleCallback
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import { 
    loginLimiter, 
    otpLimiter, 
    oauthLimiter,
    apiLimiter 
} from "../middleware/rateLimiters.js";
import { 
    registerValidation, 
    otpValidation, 
    resetPasswordValidation,
    emailValidation,
    validate 
} from "../middleware/validation.js";
import { 
    csrfProtection, 
    getCsrfToken // ✅ Corrected: Importing the function that sends the token
} from "../config/csrfProtection.js"; 

const router = express.Router();

// Apply general rate limiting to all auth routes
router.use(apiLimiter);

// ---------------- PUBLIC ROUTES ----------------

// OAuth routes with enhanced security
router.get("/google", oauthLimiter, googleAuth);
router.get("/google/callback", oauthLimiter, googleCallback);

// Traditional auth with CSRF protection where needed
router.post("/register", 
    loginLimiter,
    registerValidation,
    validate,
    register
);

router.post("/login",
    loginLimiter,
    emailValidation,
    validate,
    login
);

router.post("/send-reset-otp",
    otpLimiter,
    emailValidation,
    validate,
    sendResetOtp
);

router.post("/verify-reset-otp",
    otpLimiter,
    otpValidation,
    validate,
    verifyResetOtp
);

router.post("/reset-password",
    otpLimiter,
    resetPasswordValidation,
    validate,
    resetPassword
);

// ---------------- PROTECTED ROUTES ----------------

// Protected routes with CSRF protection
router.post("/logout", 
    userAuth,
    csrfProtection, // CSRF check for POST requests
    logout
);

router.post("/send-verify-otp", 
    userAuth,
    otpLimiter,
    csrfProtection, // CSRF check for POST requests
    sendVerifyOtp
);

router.post("/verify-email", 
    userAuth,
    otpValidation,
    validate,
    csrfProtection, // CSRF check for POST requests
    verifyEmail
);

router.get("/is-auth", 
    userAuth,
    isAuthenticated
);

// CSRF token endpoint for SPAs
// This route now directly uses getCsrfToken to generate and send the token/cookie.
router.get("/csrf-token", getCsrfToken); // ✅ Fixed: Use getCsrfToken directly
  
export default router;