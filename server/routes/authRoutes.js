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
    getMe  // ✅ IMPORT THIS!
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

// ======================
// GLOBAL RATE LIMITING
// ======================
router.use(apiLimiter);

// ======================
// GOOGLE OAUTH ROUTES
// ======================
router.get("/google", oauthLimiter, googleAuth);
router.get("/google/callback", oauthLimiter, googleCallback);

// ======================
// TRADITIONAL AUTH ROUTES
// ======================
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

// ======================
// PASSWORD RESET ROUTES
// ======================
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

// ======================
// PROTECTED ROUTES (REQUIRE AUTH)
// ======================
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

// ✅ ✅ ✅ CRITICAL: ADD THIS MISSING ROUTE! ✅ ✅ ✅
router.get("/me", 
    userAuth,
    getMe
);

// ======================
// UTILITY ROUTES
// ======================
router.get("/csrf-token", getCsrfToken);

// ======================
// ROUTE DOCUMENTATION ENDPOINT (Development only)
// ======================
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

// ======================
// HEALTH CHECK ENDPOINT
// ======================
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