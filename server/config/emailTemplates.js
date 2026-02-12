import dotenv from 'dotenv';
dotenv.config();

// -------------------- COMMON STYLE --------------------
const BASE_STYLE = `
  body {
    margin: 0; padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .card {
    width: 100%;
    max-width: 480px;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    margin: 20px;
  }
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    padding: 40px 20px;
    position: relative;
  }
  .header:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #10B981, #059669, #3B82F6);
  }
  .logo {
    width: 80px;
    height: 80px;
    background: white;
    border-radius: 50%;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
    color: #667eea;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .body {
    padding: 40px 30px;
    color: #2d3748;
    line-height: 1.7;
  }
  .otp-container {
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border-radius: 12px;
    padding: 20px;
    margin: 25px 0;
    text-align: center;
    border: 2px dashed #3b82f6;
  }
  .otp {
    font-size: 42px;
    font-weight: 800;
    letter-spacing: 8px;
    color: #1e40af;
    margin: 10px 0;
    font-family: 'Courier New', monospace;
  }
  .otp-label {
    font-size: 14px;
    color: #64748b;
    margin-top: 5px;
  }
  .btn {
    display: inline-block;
    padding: 16px 32px;
    background: linear-gradient(135deg, #10B981, #059669);
    color: white !important;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    margin: 20px 0;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    transition: all 0.3s ease;
  }
  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
  .btn-secondary {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  }
  .btn-danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }
  .footer {
    background: #f8fafc;
    padding: 25px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
  }
  .company-info {
    color: #64748b;
    font-size: 14px;
    margin-top: 10px;
  }
  .social-links {
    margin-top: 15px;
  }
  .social-links a {
    display: inline-block;
    margin: 0 8px;
    color: #64748b;
    text-decoration: none;
    font-size: 14px;
  }
  .social-links a:hover {
    color: #3b82f6;
  }
  .expiry-note {
    background: #fef3c7;
    border: 1px solid #fbbf24;
    border-radius: 8px;
    padding: 12px;
    margin: 20px 0;
    font-size: 14px;
    color: #92400e;
  }
  .security-note {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 12px;
    margin: 20px 0;
    font-size: 14px;
    color: #991b1b;
  }
`;

// -------------------- TEMPLATE VARIABLES --------------------
const COMPANY_NAME = process.env.COMPANY_NAME || 'KwetuShop';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@kwetushop.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const CURRENT_YEAR = new Date().getFullYear();
const LOGO_TEXT = COMPANY_NAME.charAt(0).toUpperCase();

// -------------------- EMAIL BUILDER --------------------
const makeEmail = (title, subtitle, content, actionBtn, note, styleOverrides = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - ${COMPANY_NAME}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <style>
    ${BASE_STYLE}
    ${styleOverrides}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">${LOGO_TEXT}</div>
      <h1 style="margin:0;font-size:28px;font-weight:800;">${title}</h1>
      <p style="margin-top:8px;font-size:15px;opacity:0.9;font-weight:300;">${subtitle}</p>
    </div>
    <div class="body">
      ${content}
      ${actionBtn || ""}
      ${note ? `<div class="expiry-note">${note}</div>` : ""}
    </div>
    <div class="footer">
      <div class="company-info">
        © ${CURRENT_YEAR} ${COMPANY_NAME}. All rights reserved.<br>
        <small>This is an automated message, please do not reply.</small>
      </div>
      <div class="social-links">
        <a href="#"><i class="fab fa-facebook"></i> Facebook</a>
        <a href="#"><i class="fab fa-twitter"></i> Twitter</a>
        <a href="#"><i class="fab fa-instagram"></i> Instagram</a>
        <a href="mailto:${SUPPORT_EMAIL}"><i class="fas fa-envelope"></i> Contact Support</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

// -------------------- TEMPLATES (ALL AS FUNCTIONS) --------------------
export const EMAIL_VERIFY_TEMPLATE = (data) => makeEmail(
  "Verify Your Email",
  "Complete your account setup with us",
  `
    <p>Hello <strong>${data.name}</strong>,</p>
    <p>Welcome to ${COMPANY_NAME}! We're excited to have you join our community.</p>
    <p>To complete your registration and verify your email <strong>${data.email}</strong>, use the verification code below:</p>
    
    <div class="otp-container">
      <div class="otp">${data.otp}</div>
      <div class="otp-label">Verification Code</div>
    </div>
    
    <p>This code is valid for <strong>10 minutes</strong>.</p>
    <p>Enter this code on the verification page to activate your account.</p>
    
    <div class="security-note">
      <i class="fas fa-shield-alt"></i> <strong>Security Tip:</strong> Never share this code with anyone. 
      ${COMPANY_NAME} will never ask for your verification code.
    </div>
  `,
  `<a href="${FRONTEND_URL}/verify-email" class="btn">Verify Email Now</a>`,
  "If you didn't create an account with us, please ignore this email."
);

export const PASSWORD_RESET_TEMPLATE = (data) => makeEmail(
  "Reset Your Password",
  "Secure your account access",
  `
    <p>Hello <strong>${data.name}</strong>,</p>
    <p>We received a password reset request for your account <strong>${data.email}</strong>.</p>
    
    <div class="otp-container">
      <div class="otp">${data.otp}</div>
      <div class="otp-label">One-Time Password</div>
    </div>
    
    <p>Use this OTP to reset your password. It will expire in <strong>10 minutes</strong>.</p>
    
    <div class="security-note">
      <i class="fas fa-exclamation-triangle"></i> <strong>Important:</strong> If you didn't request this password reset, 
      please contact our support team immediately at ${SUPPORT_EMAIL}.
    </div>
  `,
  `<a href="${FRONTEND_URL}/reset-password?token=${data.token || ''}" class="btn">Reset Password Now</a>`,
  "For security reasons, this OTP will expire in 10 minutes."
);

export const SUCCESS_VERIFICATION_TEMPLATE = (data) => makeEmail(
  "Email Verified Successfully!",
  "Your account is now fully activated",
  `
    <p>Hello <strong>${data.name}</strong>,</p>
    <p>Congratulations! Your email <strong>${data.email}</strong> has been successfully verified.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <i class="fas fa-check-circle" style="font-size: 64px; color: #10B981;"></i>
      <h3 style="color: #059669;">Account Activated Successfully</h3>
    </div>
    
    <p>You now have full access to all features of ${COMPANY_NAME}. Start exploring what we have to offer!</p>
  `,
  `<a href="${FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
   <a href="${FRONTEND_URL}/explore" class="btn btn-secondary" style="margin-left: 10px;">Explore Products</a>`
);

export const PASSWORD_RESET_SUCCESS_TEMPLATE = (data) => makeEmail(
  "Password Changed Successfully",
  "Your account security has been updated",
  `
    <p>Hello <strong>${data.name}</strong>,</p>
    <p>Your password for <strong>${data.email}</strong> has been successfully updated.</p>
    
    <div style="background: #d1fae5; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
      <i class="fas fa-lock" style="font-size: 48px; color: #059669;"></i>
      <h3 style="color: #065f46;">Account Secured</h3>
      <p>Your account security has been enhanced with the new password.</p>
    </div>
    
    <p>You can now log in with your new password. For security, we recommend:</p>
    <ul>
      <li>Using a unique password not used elsewhere</li>
      <li>Enabling two-factor authentication if available</li>
      <li>Regularly updating your password</li>
    </ul>
  `,
  `<a href="${FRONTEND_URL}/login" class="btn">Login to Your Account</a>`,
  "If you did not make this change, please contact our support team immediately."
);

export const WELCOME_TEMPLATE = (data) => makeEmail(
  `Welcome to ${COMPANY_NAME}, ${data.name}!`,
  "Your journey with us begins now",
  `
    <p>Hello <strong>${data.name}</strong>,</p>
    <p>Thank you for joining ${COMPANY_NAME}! We're thrilled to welcome you to our community.</p>
    
    <div style="background: linear-gradient(135deg, #e0f2fe, #f0f9ff); border-radius: 12px; padding: 25px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #0369a1;">Here's what you can do next:</h3>
      <ul style="color: #0c4a6e;">
        <li>🛍️ <strong>Browse our products</strong> - Discover amazing items</li>
        <li>⭐ <strong>Save your favorites</strong> - Create your wishlist</li>
        <li>📦 <strong>Track orders</strong> - Follow your purchases</li>
        <li>👤 <strong>Complete your profile</strong> - Add a profile picture</li>
      </ul>
    </div>
    
    <p>We're committed to providing you with the best shopping experience. If you have any questions, 
    our support team is always here to help.</p>
  `,
  `<a href="${FRONTEND_URL}" class="btn">Start Shopping Now</a>
   <a href="${FRONTEND_URL}/profile/setup" class="btn btn-secondary" style="margin-left: 10px;">Complete Profile</a>`,
  "This welcome email is automatically sent to all new members."
);

export const ORDER_CONFIRMATION_TEMPLATE = (data) => makeEmail(
  "Order Confirmation",
  `Order #${data.orderNumber} has been received`,
  `
    <p>Hello <strong>${data.name}</strong>,</p>
    <p>Thank you for your order! We've received your order and are preparing it for shipment.</p>
    
    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h4 style="margin-top: 0;">Order Details:</h4>
      <p><strong>Order Number:</strong> ${data.orderNumber}</p>
      <p><strong>Date:</strong> ${data.orderDate}</p>
      <p><strong>Total Amount:</strong> ${data.totalAmount}</p>
      <p><strong>Shipping Address:</strong> ${data.shippingAddress}</p>
    </div>
    
    <p>You'll receive another email when your order ships. You can track your order anytime from your account.</p>
  `,
  `<a href="${FRONTEND_URL}/orders/${data.orderId}" class="btn">View Order Details</a>
   <a href="${FRONTEND_URL}/track-order" class="btn btn-secondary" style="margin-left: 10px;">Track Order</a>`,
  `Estimated delivery: ${data.estimatedDelivery || '3-5 business days'}`
);

// -------------------- TEMPLATE HELPER FUNCTIONS --------------------
export const getTemplate = (templateName, data) => {
  const templates = {
    'email-verify': EMAIL_VERIFY_TEMPLATE,
    'password-reset': PASSWORD_RESET_TEMPLATE,
    'verification-success': SUCCESS_VERIFICATION_TEMPLATE,
    'password-reset-success': PASSWORD_RESET_SUCCESS_TEMPLATE,
    'welcome': WELCOME_TEMPLATE,
    'order-confirmation': ORDER_CONFIRMATION_TEMPLATE
  };
  
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }
  
  return template(data);
};

// -------------------- EXPORT DEFAULT --------------------
export default {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
  SUCCESS_VERIFICATION_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  WELCOME_TEMPLATE,
  ORDER_CONFIRMATION_TEMPLATE,
  getTemplate
};