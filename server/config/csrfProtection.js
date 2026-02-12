import crypto from "crypto";

const csrfExemptPaths = [
  '/csrf-token',
  '/login',
  '/setup',
  '/forgot-password',
  '/verify-reset-otp',
  '/reset-password',
  '/resend-otp'
];

export const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const csrfProtection = (req, res, next) => {
  if (
    req.method === 'GET' ||
    process.env.NODE_ENV === 'development' ||
    csrfExemptPaths.includes(req.path) ||
    req.path.includes('/google')
  ) {
    return next();
  }

  const clientToken = req.headers['x-csrf-token'] || req.body._csrf;
  const cookieToken = req.cookies['XSRF-TOKEN'];

  if (!clientToken || !cookieToken || clientToken !== cookieToken) {
    console.log('CSRF Validation Failed:', { path: req.path, clientToken, cookieToken });
    return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
  }

  next();
};

export const getCsrfToken = (req, res) => {
  const token = generateCsrfToken();
  res.cookie('XSRF-TOKEN', token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    csrfToken: token,
    message: "CSRF token generated successfully"
  });
};

export const generateOAuthState = () => crypto.randomBytes(16).toString('hex');
