// backend/routes/authRoutes.js - COMPLETE UPDATED VERSION
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
    googleCallback,
    getMe  // ✅ IMPORT THIS! - Missing in your version
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
    getCsrfToken
} from "../config/csrfProtection.js"; 

const router = express.Router();

// Apply general rate limiting to all auth routes
router.use(apiLimiter);

// ==================== UTILITY ROUTES ====================
// CSRF token endpoint for SPAs (should be accessible without auth)
router.get("/csrf-token", getCsrfToken);

// ==================== PUBLIC ROUTES ====================

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

// ==================== PROTECTED ROUTES ====================

// ✅ CRITICAL: Get current user data - needed for frontend auth state
router.get("/me", 
    userAuth,
    getMe
);

// Protected routes with CSRF protection
router.post("/logout", 
    userAuth,
    csrfProtection,
    logout
);

router.post("/send-verify-otp", 
    userAuth,
    otpLimiter,
    csrfProtection,
    sendVerifyOtp
);

router.post("/verify-email", 
    userAuth,
    otpValidation,
    validate,
    csrfProtection,
    verifyEmail
);

router.get("/is-auth", 
    userAuth,
    isAuthenticated
);

// ==================== ROUTE DOCUMENTATION (Development only) ====================
if (process.env.NODE_ENV === 'development') {
    router.get("/routes", (req, res) => {
        const routes = [];
        
        router.stack.forEach((layer) => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
                const path = layer.route.path;
                routes.push({ method: methods, path });
            }
        });
        
        res.status(200).json({
            success: true,
            message: "Available Auth Routes",
            total_routes: routes.length,
            routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
            notes: {
                csrf_required: "CSRF protection applied to all POST routes",
                rate_limiting: "All routes have rate limiting applied",
                protected: "Routes marked with * require authentication",
                google_oauth: "Complete OAuth flow: /auth/google → /auth/google/callback"
            }
        });
    });
}

// ==================== HEALTH CHECK ENDPOINT ====================
router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Auth routes are operational",
        timestamp: new Date().toISOString(),
        features: {
            google_oauth: true,
            email_auth: true,
            password_reset: true,
            email_verification: true,
            csrf_protection: true,
            rate_limiting: true
        },
        environment: process.env.NODE_ENV || 'development'
    });
});

export default router;