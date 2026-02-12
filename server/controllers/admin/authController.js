import Admin from '../../models/Admin.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from '../../config/env.js';
import { sendEmail } from '../../config/resend.js'; // ✅ CHANGED FROM nodeMailer TO resend
import { 
  PASSWORD_RESET_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  WELCOME_TEMPLATE 
} from '../../config/emailTemplates.js';
import { getEmailAssets } from '../../utils/emailAssets.js';

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// =======================================================
//                 PUBLIC ROUTES
// =======================================================

/**
 * @desc Check if system needs setup (no admins exist)
 * @route GET /api/admin/auth/check-setup
 * @access Public
 */
export const checkSetup = asyncHandler(async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();

    res.status(200).json({
      success: true,
      needsSetup: adminCount === 0,
      adminCount,
      message: adminCount === 0
        ? "System needs initial setup"
        : "System already configured"
    });
  } catch (error) {
    console.error("❌ Error checking setup:", error);
    res.status(500).json({ success: false, error: "Failed to check system setup" });
  }
});

/**
 * @desc Setup first admin if no admin exists
 * @route POST /api/admin/auth/setup
 * @access Public
 */
export const setupFirstAdmin = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (await Admin.countDocuments() > 0) {
      return res.status(400).json({
        success: false,
        error: "System already has admin. Please login instead."
      });
    }

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }

    const admin = await Admin.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: "super-admin",
      isActive: true,
      isEmailVerified: true
    });

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expire }
    );

    // ✅ Send welcome email via Resend
    try {
      const assets = getEmailAssets();
      const welcomeEmailHtml = WELCOME_TEMPLATE({
        name: admin.firstName,
        companyName: assets.companyName,
        currentYear: assets.currentYear,
        supportTeamImage: assets.supportTeamImage,
        frontendUrl: assets.adminUrl
      });

      await sendEmail({
        from: `"${assets.companyName} Admin" <${process.env.SENDER_EMAIL}>`,
        to: admin.email,
        subject: `Welcome to ${assets.companyName} Admin! 🎉`,
        html: welcomeEmailHtml,
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

    admin.password = undefined;
    console.log("✅ First admin created:", email);

    res.status(201).json({
      success: true,
      message: "System setup completed successfully",
      token,
      admin
    });
  } catch (error) {
    console.error("❌ Setup error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }
    res.status(500).json({ success: false, error: "Failed to setup system" });
  }
});

/**
 * @desc Admin login
 * @route POST /api/admin/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please provide email and password" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() })
      .select("+password"); 

    if (!admin) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, error: "Account deactivated. Contact super admin." });
    }
    
    if (!admin.isEmailVerified) {
      return res.status(403).json({ success: false, error: "Email not verified." });
    }

    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expire }
    );

    admin.password = undefined;

    res.status(200).json({ 
      success: true, 
      token, 
      admin, 
      message: "Login successful" 
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// =======================================================
//         PASSWORD RESET (OTP + Token Based)
// =======================================================

/**
 * @desc Send password reset OTP
 * @route POST /api/admin/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    return res.status(200).json({ 
      success: true, 
      message: "If an account exists, an OTP will be sent to your email." 
    });
  }
  
  if (!admin.isActive) {
    return res.status(403).json({ success: false, error: "Account is deactivated" });
  }

  const otp = generateOTP();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  admin.resetOtp = await bcrypt.hash(otp, 10);
  admin.resetOtpExpires = otpExpires;
  await admin.save({ validateBeforeSave: false });

  const assets = getEmailAssets();
  
  // ✅ FIXED: Call PASSWORD_RESET_TEMPLATE as a function, not .replace()
  const resetEmailHtml = PASSWORD_RESET_TEMPLATE({
    otp: otp,
    name: admin.firstName,
    email: admin.email,
    companyName: assets.companyName,
    currentYear: assets.currentYear,
    supportTeamImage: assets.supportTeamImage,
    frontendUrl: assets.adminUrl,
    token: ''
  });

  try {
    await sendEmail({ 
      to: admin.email, 
      subject: `Password Reset Request - ${assets.companyName} Admin`, 
      html: resetEmailHtml,
      text: `Your password reset OTP is: ${otp}. Valid for 10 minutes.`
    });
    
    // ✅ Return OTP in development for testing
    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      ...(process.env.NODE_ENV === "development" && { otp })
    });
  } catch (emailError) {
    console.error('❌ Failed to send password reset email:', emailError);
    
    // ✅ In development, return OTP even if email fails
    if (process.env.NODE_ENV === "development") {
      return res.status(200).json({
        success: true,
        message: "DEV MODE: Email not configured - OTP returned for testing",
        otp
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Failed to send reset email. Please try again." 
    });
  }
});

/**
 * @desc Verify reset OTP
 * @route POST /api/admin/auth/verify-reset-otp
 * @access Public
 */
export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: "Email and OTP required" });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+resetOtp +resetOtpExpires");
  if (!admin || !admin.resetOtp) {
    return res.status(400).json({ success: false, error: "Invalid request" });
  }

  if (Date.now() > admin.resetOtpExpires) {
    admin.resetOtp = undefined;
    admin.resetOtpExpires = undefined;
    await admin.save({ validateBeforeSave: false });
    return res.status(400).json({ success: false, error: "OTP expired" });
  }

  const isValidOtp = await bcrypt.compare(otp, admin.resetOtp);
  if (!isValidOtp) {
    return res.status(400).json({ success: false, error: "Invalid OTP" });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  admin.resetPasswordToken = verificationToken;
  admin.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await admin.save({ validateBeforeSave: false });

  res.status(200).json({ 
    success: true, 
    message: "OTP verified", 
    verificationToken 
  });
});

/**
 * @desc Reset password with verified OTP
 * @route POST /api/admin/auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, error: "Incomplete data" });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() })
    .select("+password +resetOtp +resetOtpExpires");
  
  if (!admin) {
    return res.status(400).json({ success: false, error: "Invalid request" });
  }

  if (!admin.resetOtp || Date.now() > admin.resetOtpExpires) {
    return res.status(400).json({ success: false, error: "OTP expired" });
  }

  const isValidOtp = await bcrypt.compare(otp, admin.resetOtp);
  if (!isValidOtp) {
    return res.status(400).json({ success: false, error: "Invalid OTP" });
  }

  if (await bcrypt.compare(newPassword, admin.password)) {
    return res.status(400).json({ success: false, error: "New password cannot be same as old" });
  }

  // Update password and clear reset data
  admin.password = newPassword;
  admin.resetOtp = undefined;
  admin.resetOtpExpires = undefined;
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpires = undefined;
  await admin.save();
  
  // ✅ Send password reset success email via Resend
  try {
    const assets = getEmailAssets();
    const successEmailHtml = PASSWORD_RESET_SUCCESS_TEMPLATE({
      name: admin.firstName,
      email: admin.email,
      companyName: assets.companyName,
      currentYear: assets.currentYear,
      supportTeamImage: assets.supportTeamImage,
      frontendUrl: assets.adminUrl
    });

    await sendEmail({
      from: `"${assets.companyName} Admin" <${process.env.SENDER_EMAIL}>`,
      to: admin.email,
      subject: `Password Updated Successfully - ${assets.companyName} Admin`,
      html: successEmailHtml,
    });
  } catch (emailError) {
    console.error("Failed to send success email:", emailError);
  }

  res.status(200).json({ 
    success: true, 
    message: "Password reset successful" 
  });
});

// =======================================================
//               RESEND OTP
// =======================================================

/**
 * @desc Resend password reset OTP
 * @route POST /api/admin/auth/resend-otp
 * @access Public
 */
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    return res.status(200).json({ 
      success: true, 
      message: "If account exists, OTP sent" 
    });
  }
  
  if (!admin.isActive) {
    return res.status(403).json({ success: false, error: "Account deactivated" });
  }

  // Rate limiting: Check if last OTP was sent less than 1 minute ago
  if (admin.resetOtpExpires && Date.now() < admin.resetOtpExpires - 9 * 60 * 1000) {
    const waitTime = Math.ceil((admin.resetOtpExpires - 9 * 60 * 1000 - Date.now()) / 1000);
    return res.status(429).json({ 
      success: false, 
      error: `Please wait ${waitTime} seconds before requesting again` 
    });
  }

  const otp = generateOTP();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  admin.resetOtp = await bcrypt.hash(otp, 10);
  admin.resetOtpExpires = otpExpires;
  await admin.save({ validateBeforeSave: false });

  const assets = getEmailAssets();
  
  // ✅ FIXED: Call PASSWORD_RESET_TEMPLATE as a function
  const resetEmailHtml = PASSWORD_RESET_TEMPLATE({
    otp: otp,
    name: admin.firstName,
    email: admin.email,
    companyName: assets.companyName,
    currentYear: assets.currentYear,
    supportTeamImage: assets.supportTeamImage,
    frontendUrl: assets.adminUrl,
    token: ''
  });

  try {
    await sendEmail({ 
      to: admin.email, 
      subject: `Password Reset Request - ${assets.companyName} Admin`, 
      html: resetEmailHtml,
      text: `Your password reset OTP is: ${otp}. Valid for 10 minutes.`
    });
    
    res.status(200).json({ 
      success: true, 
      message: "OTP sent", 
      ...(process.env.NODE_ENV === "development" && { otp }) 
    });
  } catch (mailErr) {
    console.error("❌ Failed to resend OTP:", mailErr);
    
    if (process.env.NODE_ENV === "development") {
      return res.status(200).json({ 
        success: true, 
        message: "DEV MODE: Email not configured - OTP returned for testing",
        otp 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Failed to send OTP. Please try again." 
    });
  }
});

// =======================================================
//               PROTECTED ROUTES
// =======================================================

/**
 * @desc Get current admin profile
 * @route GET /api/admin/auth/me
 * @access Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id);
  if (!admin) {
    return res.status(404).json({ success: false, error: "Admin not found" });
  }
  res.status(200).json({ success: true, data: admin });
});

/**
 * @desc Logout admin
 * @route POST /api/admin/auth/logout
 * @access Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

/**
 * @desc Check authentication status
 * @route GET /api/admin/auth/check-auth
 * @access Private
 */
export const checkAuth = asyncHandler(async (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Authenticated", 
    admin: req.admin 
  });
});

/**
 * @desc Update admin profile
 * @route PUT /api/admin/auth/profile
 * @access Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const admin = await Admin.findById(req.admin.id);
  
  if (!admin) {
    return res.status(404).json({ success: false, error: "Admin not found" });
  }

  if (email && email !== admin.email) {
    const emailExists = await Admin.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: admin._id } 
    });
    if (emailExists) {
      return res.status(400).json({ success: false, error: "Email already in use" });
    }
  }

  admin.firstName = firstName || admin.firstName;
  admin.lastName = lastName || admin.lastName;
  admin.email = email ? email.toLowerCase() : admin.email;

  const updated = await admin.save();
  res.status(200).json({ 
    success: true, 
    data: updated, 
    message: "Profile updated" 
  });
});

/**
 * @desc Change admin password
 * @route PUT /api/admin/auth/change-password
 * @access Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      success: false, 
      error: "Provide current and new password" 
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ 
      success: false, 
      error: "Password must be at least 6 characters" 
    });
  }

  const admin = await Admin.findById(req.admin.id).select("+password");
  if (!admin) {
    return res.status(404).json({ success: false, error: "Admin not found" });
  }

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: "Current password incorrect" });
  }

  if (await admin.comparePassword(newPassword)) {
    return res.status(400).json({ 
      success: false, 
      error: "New password cannot be the same as current password" 
    });
  }

  admin.password = newPassword;
  await admin.save();
  
  res.status(200).json({ 
    success: true, 
    message: "Password changed successfully" 
  });
});

/**
 * @desc Upload admin avatar
 * @route POST /api/admin/auth/upload-avatar
 * @access Private
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "Please upload an image file" });
  }

  const admin = await Admin.findById(req.admin.id);
  if (!admin) {
    return res.status(404).json({ success: false, error: "Admin not found" });
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  admin.avatar = avatarUrl;
  await admin.save();

  res.status(200).json({ 
    success: true, 
    message: "Avatar uploaded successfully", 
    avatar: avatarUrl 
  });
});

/**
 * @desc Test email configuration
 * @route GET /api/admin/auth/test-email
 * @access Private (Super Admin only)
 */
export const testEmailConfig = asyncHandler(async (req, res) => {
  try {
    const assets = getEmailAssets();
    const testEmailHtml = `
      <!DOCTYPE html>
      <html>
      <body>
        <h2>Admin Test Email ✅</h2>
        <p>Resend email configuration for ${assets.companyName} Admin is working!</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>Admin: ${req.admin.firstName} ${req.admin.lastName} (${req.admin.email})</p>
      </body>
      </html>
    `;
    
    const result = await sendEmail({
      from: `"${assets.companyName} Admin" <${process.env.SENDER_EMAIL}>`,
      to: req.admin.email,
      subject: `📧 Admin Test Email - ${assets.companyName}`,
      html: testEmailHtml,
    });
    
    res.status(200).json({
      success: result.success,
      message: result.success ? 'Test email sent successfully via Resend!' : 'Failed to send test email',
      ...(process.env.NODE_ENV === 'development' && { debug: result })
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email'
    });
  }
});
