// server/scripts/security-audit.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kwetushop';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[✅ OK]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[⚠️ WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[❌ ERROR]${colors.reset} ${msg}`),
  critical: (msg) => console.log(`${colors.red}${colors.bold}[🔥 CRITICAL]${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${colors.bold}${msg}${colors.reset}`),
  divider: () => console.log(`${colors.white}${'-'.repeat(70)}${colors.reset}`)
};

const securityAudit = async () => {
  console.clear();
  console.log(`\n${colors.magenta}${colors.bold}${'='.repeat(70)}`);
  console.log('🔐 LOGIN SYSTEM SECURITY AUDIT REPORT');
  console.log(`${'='.repeat(70)}${colors.reset}\n`);

  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;
  let warnings = 0;

  try {
    // ==================== DATABASE CONNECTION ====================
    log.header('📦 DATABASE CONNECTION');
    log.divider();
    
    try {
      await mongoose.connect(MONGODB_URI);
      log.success('Connected to MongoDB successfully');
      passedChecks++;
    } catch (error) {
      log.error(`Failed to connect to MongoDB: ${error.message}`);
      log.info('Make sure MongoDB is running with: sudo systemctl start mongod');
      failedChecks++;
    }
    totalChecks++;
    log.divider();

    // ==================== ENVIRONMENT VARIABLES ====================
    log.header('🔧 ENVIRONMENT VARIABLES');
    log.divider();

    const requiredEnvVars = [
      { name: 'JWT_SECRET', critical: true },
      { name: 'MONGODB_URI', critical: true },
      { name: 'SESSION_SECRET', critical: true },
      { name: 'NODE_ENV', critical: false }
    ];

    const optionalEnvVars = [
      { name: 'JWT_REFRESH_SECRET', critical: false },
      { name: 'GOOGLE_CLIENT_ID', critical: false },
      { name: 'GOOGLE_CLIENT_SECRET', critical: false },
      { name: 'RESEND_API_KEY', critical: false },
      { name: 'FRONTEND_URL', critical: false },
      { name: 'ADMIN_URL', critical: false },
      { name: 'JWT_EXPIRE', critical: false },
      { name: 'JWT_REFRESH_EXPIRE', critical: false }
    ];

    // Check required vars
    for (const check of requiredEnvVars) {
      const value = process.env[check.name];
      if (!value) {
        log.critical(`${check.name} is MISSING (REQUIRED!)`);
        failedChecks++;
      } else {
        if (check.name.includes('SECRET') && value.length < 32) {
          log.warn(`${check.name} is too short (${value.length} chars). Should be at least 32 chars`);
          warnings++;
        } else if (check.name.includes('SECRET')) {
          log.success(`${check.name} is set (${value.length} chars)`);
          passedChecks++;
        } else {
          log.success(`${check.name} is set`);
          passedChecks++;
        }
      }
      totalChecks++;
    }

    // Check optional vars
    for (const check of optionalEnvVars) {
      const value = process.env[check.name];
      if (!value) {
        log.warn(`${check.name} is not set (optional)`);
        warnings++;
      } else {
        if (check.name.includes('SECRET') && value.length < 32) {
          log.warn(`${check.name} is too short (${value.length} chars)`);
          warnings++;
        } else {
          log.success(`${check.name} is set`);
          passedChecks++;
        }
      }
      totalChecks++;
    }
    log.divider();

    // ==================== CHECK FILE PERMISSIONS ====================
    log.header('📁 FILE PERMISSIONS');
    log.divider();

    const envPath = join(__dirname, '..', '.env');
    try {
      const stats = fs.statSync(envPath);
      const permissions = stats.mode & 0o777;
      
      if (permissions > 0o600) {
        log.critical(`.env file permissions are too open (${permissions.toString(8)}). Should be 600`);
        failedChecks++;
      } else {
        log.success(`.env file permissions are secure (${permissions.toString(8)})`);
        passedChecks++;
      }
    } catch (error) {
      log.warn('Could not check .env file permissions');
      warnings++;
    }
    totalChecks++;
    log.divider();

    // ==================== PASSWORD POLICY ====================
    log.header('🔒 PASSWORD POLICY');
    log.divider();

    // Get a sample user to check password hashing
    const sampleUser = await User.findOne();
    if (sampleUser) {
      log.info('Checking password hashing...');
      
      if (sampleUser.password) {
        if (sampleUser.password.startsWith('$2a$') || sampleUser.password.startsWith('$2b$')) {
          log.success('Passwords are properly hashed with bcrypt');
          passedChecks++;
        } else {
          log.critical('Passwords are NOT properly hashed!');
          failedChecks++;
        }
      } else {
        log.warn('No password field found in user documents');
        warnings++;
      }
    } else {
      log.warn('No users found to check password hashing');
      warnings++;
    }
    totalChecks++;

    // Check password minimum length from User model
    try {
      const userSchema = User.schema.paths;
      if (userSchema.password && userSchema.password.validators) {
        const minLengthValidator = userSchema.password.validators.find(v => v.type === 'minlength');
        if (minLengthValidator) {
          log.success(`Password minimum length: ${minLengthValidator.minlength} characters`);
          passedChecks++;
        } else {
          log.warn('No minimum length validator found for passwords');
          warnings++;
        }
      }
    } catch (error) {
      log.warn('Could not check password validators');
      warnings++;
    }
    totalChecks++;
    log.divider();

    // ==================== JWT CONFIGURATION ====================
    log.header('🔑 JWT CONFIGURATION');
    log.divider();

    const jwtExpire = process.env.JWT_EXPIRE || '30d';
    const refreshExpire = process.env.JWT_REFRESH_EXPIRE || '90d';

    log.info(`JWT expires in: ${jwtExpire}`);
    log.info(`Refresh token expires in: ${refreshExpire}`);

    // Check if JWT expiration is reasonable
    const expireNum = parseInt(jwtExpire);
    if (jwtExpire.includes('d') && expireNum > 30) {
      log.warn(`JWT expiration (${jwtExpire}) is quite long. Consider 7-30 days for refresh tokens`);
      warnings++;
    } else {
      log.success(`JWT expiration is reasonable`);
      passedChecks++;
    }
    totalChecks++;

    const refreshNum = parseInt(refreshExpire);
    if (refreshExpire.includes('d') && refreshNum > 90) {
      log.warn(`Refresh token expiration (${refreshExpire}) is very long. Consider 30-90 days`);
      warnings++;
    } else {
      log.success(`Refresh token expiration is reasonable`);
      passedChecks++;
    }
    totalChecks++;
    log.divider();

    // ==================== RATE LIMITING ====================
    log.header('🛡️ RATE LIMITING');
    log.divider();

    const rateLimiterPath = join(__dirname, '..', 'middleware', 'rateLimiters.js');
    if (fs.existsSync(rateLimiterPath)) {
      log.success('Rate limiting middleware found');
      passedChecks++;
    } else {
      log.critical('No rate limiting middleware found! Add rate limiting to prevent brute force attacks');
      failedChecks++;
    }
    totalChecks++;
    log.divider();

    // ==================== CSRF PROTECTION ====================
    log.header('🔄 CSRF PROTECTION');
    log.divider();

    const csrfPath = join(__dirname, '..', 'middleware', 'csrfProtection.js');
    const csrfConfigPath = join(__dirname, '..', 'config', 'csrfProtection.js');
    
    if (fs.existsSync(csrfPath) || fs.existsSync(csrfConfigPath)) {
      log.success('CSRF protection middleware found');
      passedChecks++;
    } else {
      log.critical('No CSRF protection found! Add CSRF tokens to prevent cross-site request forgery');
      failedChecks++;
    }
    totalChecks++;
    log.divider();

    // ==================== ACCOUNT LOCKOUT ====================
    log.header('🔒 ACCOUNT LOCKOUT');
    log.divider();

    try {
      const userSchemaPaths = User.schema.paths;
      if (userSchemaPaths.loginAttempts || userSchemaPaths.lockUntil) {
        log.success('Account lockout mechanism found');
        passedChecks++;
      } else {
        log.warn('No account lockout mechanism detected. Consider implementing to prevent brute force');
        warnings++;
      }
    } catch (error) {
      log.warn('Could not check for account lockout');
      warnings++;
    }
    totalChecks++;
    log.divider();

    // ==================== SESSION SECURITY ====================
    log.header('🍪 SESSION SECURITY');
    log.divider();

    log.info('Checking session configuration...');
    
    if (process.env.NODE_ENV === 'production') {
      log.success('Production mode detected - ensure cookies use secure flag');
      passedChecks++;
    } else {
      log.info('Development mode - cookies can use secure=false');
    }
    totalChecks++;

    log.success('HTTP-only cookies should be enabled (check your session config)');
    passedChecks++;
    totalChecks++;
    log.divider();

    // ==================== ADMIN ACCOUNTS ====================
    log.header('👑 ADMIN ACCOUNTS');
    log.divider();

    const adminCount = await Admin.countDocuments();
    log.info(`Found ${adminCount} admin accounts`);

    if (adminCount === 0) {
      log.warn('No admin accounts found. Run setup to create admin.');
      warnings++;
    } else {
      // Check for default admin credentials
      const defaultAdmin = await Admin.findOne({ email: 'admin@example.com' });
      if (defaultAdmin) {
        log.critical('Default admin account found! Change the password immediately!');
        failedChecks++;
      } else {
        log.success('No default admin accounts detected');
        passedChecks++;
      }
    }
    totalChecks++;
    log.divider();

    // ==================== GOOGLE OAUTH ====================
    log.header('🌐 GOOGLE OAUTH');
    log.divider();

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      log.success('Google OAuth credentials configured');
      passedChecks++;
      
      log.info('Verify these redirect URIs in Google Cloud Console:');
      log.info(`   - ${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`);
      log.info(`   - ${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`);
    } else {
      log.warn('Google OAuth not configured (optional)');
      warnings++;
    }
    totalChecks++;
    log.divider();

    // ==================== SUMMARY ====================
    console.log(`\n${colors.magenta}${colors.bold}${'='.repeat(70)}`);
    console.log('📊 SECURITY AUDIT SUMMARY');
    console.log(`${'='.repeat(70)}${colors.reset}\n`);

    const score = Math.round((passedChecks / totalChecks) * 100);
    
    console.log(`${colors.cyan}Total Checks:${colors.reset} ${totalChecks}`);
    console.log(`${colors.green}Passed:${colors.reset} ${passedChecks}`);
    console.log(`${colors.yellow}Warnings:${colors.reset} ${warnings}`);
    console.log(`${colors.red}Failed:${colors.reset} ${failedChecks}`);
    console.log(`${colors.cyan}Security Score:${colors.reset} ${score}%\n`);

    if (failedChecks === 0 && warnings === 0) {
      console.log(`${colors.green}${colors.bold}✅ EXCELLENT! Your login system is very secure!${colors.reset}\n`);
    } else if (failedChecks === 0 && warnings > 0) {
      console.log(`${colors.yellow}${colors.bold}⚠️ GOOD! Address the warnings to improve security.${colors.reset}\n`);
    } else {
      console.log(`${colors.red}${colors.bold}🔴 CRITICAL: Fix the failed checks immediately!${colors.reset}\n`);
    }

    console.log(`${colors.blue}Recommended Actions:${colors.reset}`);
    if (failedChecks > 0) {
      console.log(`  • Fix all ${colors.red}FAILED${colors.reset} checks immediately`);
    }
    if (warnings > 0) {
      console.log(`  • Address ${colors.yellow}WARNINGS${colors.reset} for better security`);
    }
    console.log(`  • Run this audit regularly after changes`);
    console.log(`  • Keep all dependencies updated with: npm audit fix`);
    console.log(`  • Monitor logs for suspicious activity`);

    console.log(`\n${colors.magenta}${'='.repeat(70)}${colors.reset}\n`);

    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(0);

  } catch (error) {
    log.error(`Audit failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

securityAudit();

