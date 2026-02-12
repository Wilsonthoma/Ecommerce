import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from '../models/User.js';
import { sendEmail } from "../config/resend.js";
import { 
  EMAIL_VERIFY_TEMPLATE, 
  PASSWORD_RESET_TEMPLATE, 
  SUCCESS_VERIFICATION_TEMPLATE, 
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  WELCOME_TEMPLATE 
} from "../config/emailTemplates.js";
import { getEmailAssets } from "../utils/emailAssets.js";
import { OAuth2Client } from 'google-auth-library';
import { asyncHandler } from "../middleware/errorHandler.js";

// ==================== SECURITY CONSTANTS ====================
const SECURITY = {
  MAX_OTP_ATTEMPTS: 5,
  OTP_LOCKOUT_DURATION_MS: 15 * 60 * 1000,
  OTP_VALIDITY_MS: 10 * 60 * 1000,
  RESET_VERIFICATION_VALIDITY_MS: 15 * 60 * 1000,
  JWT_EXPIRY: "7d",
  BCRYPT_ROUNDS: 12
};

// ==================== GOOGLE OAUTH CLIENT ====================
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// ==================== UTILITY FUNCTIONS ====================

const generateSecureOTP = () => crypto.randomInt(100000, 999999).toString();

const setSecurityHeaders = (res) => {
  res.set({
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
};

const getSecureCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
});

const generateSecureToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: SECURITY.JWT_EXPIRY }
  );
};

// ==================== GOOGLE OAUTH ====================

export const googleAuth = asyncHandler(async (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString('hex');
    if (req.session) {
      req.session.oauthState = state;
    }
    
    const authUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      prompt: 'consent',
      state: state
    });
    
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate Google authentication' 
    });
  }
});

/**
 * @desc    Google OAuth callback - COMPLETELY FIXED with account merging
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=${error}`);
  }

  if (!state || state !== req.session?.oauthState) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
  }

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
  }

  try {
    const { tokens } = await googleClient.getToken(code);
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;

    console.log(`🔐 Google OAuth callback for email: ${email}`);

    // FIRST: Try to find user by email (MOST IMPORTANT!)
    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      console.log(`✅ User found by email: ${email}`);
      
      // Check if this is a password-based account that needs OAuth linking
      if (!user.oauth?.google) {
        console.log(`🔗 Linking Google OAuth to existing account: ${email}`);
        
        // Store existing password (don't overwrite)
        const existingPassword = user.password;
        
        // Link Google OAuth
        user.oauth = { 
          ...user.oauth,
          google: googleId 
        };
        user.avatar = picture || user.avatar;
        
        // If Google says email is verified, verify the account
        if (email_verified && !user.isAccountVerified) {
          user.isAccountVerified = true;
        }
        
        // Preserve password if it exists
        if (existingPassword) {
          user.password = existingPassword;
        }
        
        await user.save();
        console.log(`✅ Successfully linked Google OAuth to existing account`);
      } else {
        console.log(`ℹ️ Account already has Google OAuth linked`);
      }
      
    } else {
      // Try to find by Google ID (in case user already has OAuth)
      user = await User.findOne({ 'oauth.google': googleId });
      
      if (user) {
        console.log(`✅ User found by Google ID: ${googleId}`);
        // Update existing OAuth user
        user.avatar = picture || user.avatar;
        user.lastLogin = new Date();
        await user.save();
        
      } else {
        // Create NEW user with Google OAuth
        console.log(`🆕 Creating new Google OAuth user: ${email}`);
        user = new User({
          name: name?.substring(0, 50) || email.split('@')[0] || 'Google User',
          email: email.toLowerCase().trim(),
          password: null,
          oauth: { google: googleId },
          isAccountVerified: email_verified || true,
          avatar: picture,
          status: 'active',
          lastLogin: new Date(),
          loginCount: 1
        });
        await user.save();
        console.log(`✅ New Google OAuth user created`);
      }
    }

    // Generate JWT token
    const token = generateSecureToken(user._id);
    
    // Set cookie
    res.cookie("token", token, getSecureCookieOptions());

    // Redirect with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&login=success&source=google`);

  } catch (error) {
    console.error("❌ Google callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

// ==================== TRADITIONAL AUTH ====================

export const register = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user exists - including OAuth accounts
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      // If user exists but is an OAuth account without password
      if (existingUser.oauth?.google && !existingUser.password) {
        return res.status(400).json({
          success: false,
          message: 'This email is registered with Google. Please sign in with Google.',
          code: 'USE_GOOGLE_AUTH'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      isAccountVerified: false,
      status: 'active'
    });

    await user.save();

    const token = generateSecureToken(user._id);
    res.cookie("token", token, getSecureCookieOptions());

    // Send welcome email
    try {
      const assets = getEmailAssets();
      const welcomeEmailHtml = WELCOME_TEMPLATE({
        name: user.name,
        companyName: assets.companyName,
        currentYear: assets.currentYear,
        supportTeamImage: assets.supportTeamImage,
        frontendUrl: assets.frontendUrl
      });

      await sendEmail({
        from: `"${assets.companyName}" <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: `Welcome to ${assets.companyName}! 🎉`,
        html: welcomeEmailHtml,
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(423).json({
        success: false,
        message: `Account is locked. Try again in ${minutesLeft} minutes.`
      });
    }

    // Better OAuth account handling with clear message
    if (user.oauth?.google && !user.password) {
      return res.status(401).json({ 
        success: false, 
        message: "This email is registered with Google. Please sign in with Google.",
        code: "USE_GOOGLE_AUTH",
        action: "google_login"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      
      await user.save();
      
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = generateSecureToken(user._id);
    res.cookie("token", token, getSecureCookieOptions());

    res.status(200).json({ 
      success: true, 
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        authMethod: user.oauth?.google ? 'google' : 'traditional'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", getSecureCookieOptions());
  res.status(200).json({ 
    success: true, 
    message: "Logged out successfully" 
  });
});

// ==================== FIXED: EMAIL VERIFICATION FUNCTIONS ====================

/**
 * @desc    Send email verification OTP - COMPLETELY FIXED
 * @route   POST /api/auth/send-verify-otp
 * @access  Private
 */
export const sendVerifyOtp = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    
    console.log("🔍 SendVerifyOtp - User ID:", userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "Account already verified" 
      });
    }

    // Check if account is locked due to too many failed attempts
    if (user.otpLockoutUntil && user.otpLockoutUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.otpLockoutUntil - Date.now()) / (60 * 1000));
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Try again in ${minutesLeft} minutes.`,
        lockoutUntil: user.otpLockoutUntil
      });
    }

    // Use the model's method to generate OTP
    const otp = user.generateVerifyOtp();
    await user.save();
    
    console.log(`✅ OTP saved for ${user.email}: ${otp}`);
    console.log(`⏰ Expires at: ${new Date(user.verifyOtpExpiredAt).toLocaleTimeString()}`);

    // Try to send email
    let emailSent = false;
    try {
      const assets = getEmailAssets();
      const emailHtml = EMAIL_VERIFY_TEMPLATE({
        otp: otp,
        name: user.name,
        email: user.email,
        companyName: assets.companyName,
        currentYear: assets.currentYear,
        supportTeamImage: assets.supportTeamImage,
        frontendUrl: assets.frontendUrl
      });

      await sendEmail({
        from: `"${assets.companyName} Verification" <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: `Your Verification Code - ${assets.companyName}`,
        html: emailHtml,
      });
      
      emailSent = true;
      console.log(`✅ Email sent to ${user.email}`);
    } catch (emailError) {
      console.log(`⚠️ Email failed to send: ${emailError.message}`);
    }

    // Always return success with OTP in development
    const response = {
      success: true,
      message: emailSent 
        ? "Verification code sent to your email" 
        : "Verification code generated (email unavailable)",
      expiresIn: "10 minutes"
    };

    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
      response.emailSent = emailSent;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Send verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate verification code'
    });
  }
});

/**
 * @desc    Verify email with OTP - COMPLETELY FIXED
 * @route   POST /api/auth/verify-email
 * @access  Private
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { otp } = req.body;
    
    // Validate OTP input
    if (!otp) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP is required" 
      });
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP must be a 6-digit number" 
      });
    }
    
    // Get userId from multiple possible locations
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    // Find user with OTP fields selected
    const user = await User.findById(userId).select(
      '+verifyOtp +verifyOtpExpiredAt +failedOtpAttempts +otpLockoutUntil'
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "Account already verified" 
      });
    }

    // Check if account is locked due to too many failed attempts
    if (user.otpLockoutUntil && user.otpLockoutUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.otpLockoutUntil - Date.now()) / (60 * 1000));
      return res.status(429).json({ 
        success: false, 
        message: `Too many failed attempts. Try again in ${minutesLeft} minutes.`,
        lockoutUntil: user.otpLockoutUntil
      });
    }

    // Use the model's method to verify OTP
    const verificationResult = user.verifyEmailOtp(otp);
    
    if (!verificationResult.isValid) {
      await user.save();
      return res.status(400).json({ 
        success: false, 
        message: verificationResult.message,
        attemptsRemaining: verificationResult.attemptsRemaining
      });
    }

    await user.save();

    console.log(`✅ Email verified successfully for: ${user.email}`);

    // Send welcome email after verification
    try {
      const assets = getEmailAssets();
      const welcomeEmailHtml = WELCOME_TEMPLATE({
        name: user.name,
        companyName: assets.companyName,
        currentYear: assets.currentYear,
        supportTeamImage: assets.supportTeamImage,
        frontendUrl: assets.frontendUrl
      });

      await sendEmail({
        to: user.email,
        subject: `Welcome to ${assets.companyName}! 🎉`,
        html: welcomeEmailHtml,
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: "Email verified successfully! Your account is now fully activated."
    });

  } catch (error) {
    console.error('❌ Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email. Please try again.'
    });
  }
});

// ==================== PASSWORD RESET FUNCTIONS ====================

export const sendResetOtp = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset OTP has been sent.",
        ...(process.env.NODE_ENV === 'development' && { 
          _debug: { userFound: false, email } 
        })
      });
    }

    if (user.oauth?.google && !user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google authentication. Please sign in with Google."
      });
    }

    if (user.otpLockoutUntil && user.otpLockoutUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.otpLockoutUntil - Date.now()) / (60 * 1000));
      return res.status(429).json({
        success: false,
        message: `Too many OTP attempts. Try again in ${minutesLeft} minutes.`
      });
    }

    // Use the model's method to generate OTP
    const otp = user.generateResetOtp();
    await user.save();

    const assets = getEmailAssets();
    
    const resetEmailHtml = PASSWORD_RESET_TEMPLATE({
      otp: otp,
      name: user.name,
      email: user.email,
      companyName: assets.companyName,
      currentYear: assets.currentYear,
      supportTeamImage: assets.supportTeamImage,
      frontendUrl: assets.frontendUrl,
      token: ''
    });

    await sendEmail({
      from: `"${assets.companyName} Support" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: `Password Reset Request - ${assets.companyName}`,
      html: resetEmailHtml,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 [DEV] Password reset OTP for ${email}: ${otp}`);
    }

    const responseData = {
      success: true,
      message: "If an account exists with this email, a password reset OTP has been sent.",
      expiresIn: "10 minutes"
    };

    if (process.env.NODE_ENV === 'development') {
      responseData.otp = otp;
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error('\n❌ SEND RESET OTP - ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset code'
    });
  }
});

export const verifyResetOtp = asyncHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+resetOtp +resetOtpExpiredAt +resetOtpVerified +resetOtpVerifiedAt +failedOtpAttempts +otpLockoutUntil');
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid request" 
      });
    }

    const verificationResult = user.verifyResetOtp(otp);
    
    if (!verificationResult.isValid) {
      await user.save();
      return res.status(400).json({ 
        success: false, 
        message: verificationResult.message,
        attemptsRemaining: verificationResult.attemptsRemaining
      });
    }

    await user.save();

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ OTP verified successfully for ${email}`);
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
    });

  } catch (error) {
    console.error('❌ Verify reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, OTP and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password +resetOtp +resetOtpVerified +resetOtpVerifiedAt');
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid request" 
      });
    }

    if (!user.resetOtpVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP not verified. Please verify the OTP first." 
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP. Please verify again." 
      });
    }

    if (!user.resetOtpVerifiedAt) {
      user.clearResetOtpData();
      await user.save();
      return res.status(400).json({ 
        success: false, 
        message: "OTP verification expired. Please request a new code." 
      });
    }

    const timeSinceVerification = Date.now() - user.resetOtpVerifiedAt.getTime();
    if (timeSinceVerification > SECURITY.RESET_VERIFICATION_VALIDITY_MS) {
      user.clearResetOtpData();
      await user.save();
      return res.status(400).json({ 
        success: false, 
        message: "OTP verification expired. Please request a new code." 
      });
    }

    const isSameAsOldPassword = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOldPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "New password cannot be the same as your current password." 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SECURITY.BCRYPT_ROUNDS);
    user.password = hashedPassword;
    user.clearResetOtpData();
    await user.save();

    // Send password reset success email
    try {
      const assets = getEmailAssets();
      const successEmailHtml = PASSWORD_RESET_SUCCESS_TEMPLATE({
        name: user.name,
        email: user.email,
        companyName: assets.companyName,
        currentYear: assets.currentYear,
        supportTeamImage: assets.supportTeamImage,
        frontendUrl: assets.frontendUrl
      });

      await sendEmail({
        from: `"${assets.companyName}" <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: `Password Updated Successfully - ${assets.companyName}`,
        html: successEmailHtml,
      });
    } catch (emailError) {
      console.error('Password reset success email failed:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// ==================== USER PROFILE FUNCTIONS ====================

export const getMe = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const user = await User.findById(userId).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isAccountVerified: user.isAccountVerified,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
});

export const isAuthenticated = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id || req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: 'Not authenticated'
    });
  }

  res.status(200).json({
    success: true,
    authenticated: true,
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email,
      isAccountVerified: req.user.isAccountVerified,
      role: req.user.role
    }
  });
});

// ==================== TEST ENDPOINTS ====================

export const testEmailConnection = asyncHandler(async (req, res) => {
  try {
    const assets = getEmailAssets();
    const testEmailHtml = `
      <!DOCTYPE html>
      <html>
      <body>
        <h2>Test Email ✅</h2>
        <p>Resend email configuration for ${assets.companyName} is working!</p>
        <p>API Key: ${process.env.RESEND_API_KEY?.substring(0, 8)}...</p>
        <p>Time: ${new Date().toISOString()}</p>
      </body>
      </html>
    `;
    
    const result = await sendEmail({
      from: `"${assets.companyName}" <${process.env.SENDER_EMAIL}>`,
      to: process.env.TEST_EMAIL || 'test@example.com',
      subject: `📧 Test Email - ${assets.companyName}`,
      html: testEmailHtml,
    });
    
    res.status(200).json({
      success: result.success,
      message: result.success ? 'Test email sent successfully via Resend!' : 'Failed to send test email',
      messageId: result.messageId,
      ...(process.env.NODE_ENV === 'development' && { debug: result })
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    });
  }
});

export const debugEmailConfig = asyncHandler(async (req, res) => {
  try {
    const assets = getEmailAssets();
    const config = {
      environment: process.env.NODE_ENV,
      email: {
        provider: 'Resend',
        SENDER_EMAIL: process.env.SENDER_EMAIL,
        hasResendKey: !!process.env.RESEND_API_KEY,
        keyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) + '...',
        keyLength: process.env.RESEND_API_KEY?.length || 0
      },
      assets: assets
    };
    
    res.status(200).json({
      success: true,
      message: "Resend email configuration debug info",
      config: config
    });
  } catch (error) {
    console.error('Debug email config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email config'
    });
  }
});