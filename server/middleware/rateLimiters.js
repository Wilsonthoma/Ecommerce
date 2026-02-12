import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { log } from '../utils/logger.js';

// ---------------- BASE CONFIGURATION ---------------- //
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const OTP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const LOGIN_BRUTE_FORCE_WINDOW = 60 * 60 * 1000; // 1 hour

const BASE_RATE_LIMITER_CONFIG = {
    standardHeaders: true,
    legacyHeaders: false,
};

// Initialize Redis for rate limiting if available
let redisClient = null;
if (process.env.REDIS_URL) {
    try {
        redisClient = new Redis(process.env.REDIS_URL);
        redisClient.on('error', (err) => {
            console.error('Redis rate limiter error:', err);
        });
    } catch (error) {
        console.warn('Redis not available, using memory store');
    }
}

// Get client identifier (IP or email)
const getClientIdentifier = (req) => {
    if (req.body && req.body.email) {
        return req.body.email;
    }
    
    const ip = req.ip || 
               req.headers['x-forwarded-for']?.split(',')[0] || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress || 
               '0.0.0.0';
    
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
        return '127.0.0.1';
    }
    
    if (ip.includes('::ffff:')) {
        return ip.replace('::ffff:', '');
    }
    
    if (ip.includes(':')) {
        const segments = ip.split(':');
        if (segments.length >= 4) {
            return segments.slice(0, 4).join(':');
        }
    }
    
    return ip;
};

// Rate limiter factory
const createRateLimiter = (options = {}) => {
    const {
        windowMs = WINDOW_MS,
        max = 100,
        message = 'Too many requests, please try again later.',
        keyGenerator = getClientIdentifier,
        skipSuccessfulRequests = false,
        skip = (req) => false,
        prefix = 'rl'
    } = options;

    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message,
            retryAfter: Math.ceil(windowMs / 1000),
            limit: max
        },
        ...BASE_RATE_LIMITER_CONFIG,
        keyGenerator,
        skipSuccessfulRequests,
        skip,
        store: redisClient ? new RedisStore({
            client: redisClient,
            prefix: `${prefix}:`,
            sendCommand: (...args) => redisClient.call(...args)
        }) : undefined,
        handler: (req, res, next, options) => {
            if (log?.warn) {
                log.warn('Rate limit exceeded', {
                    path: req.path,
                    method: req.method,
                    ip: getClientIdentifier(req),
                    userId: req.user?.id,
                    limit: max,
                    windowMs
                });
            }
            
            res.status(429).json(options.message);
        }
    });
};

// ---------------- RATE LIMITERS ----------------

/**
 * Login attempts - 15 per hour
 */
export const loginLimiter = createRateLimiter({
    windowMs: LOGIN_BRUTE_FORCE_WINDOW,
    max: process.env.NODE_ENV === 'development' ? 50 : 15, // ✅ Higher in dev
    message: 'Too many login attempts. Please try again after 1 hour.',
    prefix: 'login',
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        const email = req.body?.email?.toLowerCase() || '';
        const clientIp = getClientIdentifier(req);
        return `${clientIp}:${email}`;
    }
});

/**
 * OTP requests - 3 per 5 minutes (10 in development)
 */
export const otpLimiter = createRateLimiter({
    windowMs: OTP_WINDOW_MS,
    max: process.env.NODE_ENV === 'development' ? 10 : 3, // ✅ Higher in dev
    message: 'Too many OTP requests. Try again after 5 minutes.',
    prefix: 'otp',
    keyGenerator: (req) => getClientIdentifier(req)
});

/**
 * OAuth attempts - 10 per 15 minutes
 */
export const oauthLimiter = createRateLimiter({
    windowMs: WINDOW_MS,
    max: process.env.NODE_ENV === 'development' ? 30 : 10, // ✅ Higher in dev
    message: 'Too many OAuth attempts, please try again after 15 minutes.',
    prefix: 'oauth',
    keyGenerator: (req) => getClientIdentifier(req)
});

/**
 * General API - 100 per 15 minutes (500 in development)
 */
export const apiLimiter = createRateLimiter({
    windowMs: WINDOW_MS,
    max: process.env.NODE_ENV === 'development' ? 500 : 100, // ✅ Higher in dev
    message: 'Too many requests, please try again later.',
    prefix: 'api',
    keyGenerator: (req) => getClientIdentifier(req)
});

/**
 * Registration - 3 per hour (10 in development)
 */
export const registerLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 10 : 3, // ✅ Higher in dev
    message: 'Too many registration attempts from this IP.',
    prefix: 'register',
    keyGenerator: (req) => getClientIdentifier(req)
});

/**
 * Authenticated users - 500 per 15 minutes (1000 in development)
 */
export const authenticatedLimiter = createRateLimiter({
    windowMs: WINDOW_MS,
    max: process.env.NODE_ENV === 'development' ? 1000 : 500, // ✅ Higher in dev
    message: 'Too many requests.',
    prefix: 'auth',
    keyGenerator: (req) => req.user?.id || getClientIdentifier(req)
});

/**
 * Admin users - 1000 per 15 minutes (2000 in development)
 */
export const adminLimiter = createRateLimiter({
    windowMs: WINDOW_MS,
    max: process.env.NODE_ENV === 'development' ? 2000 : 1000, // ✅ Higher in dev
    message: 'Too many admin requests.',
    prefix: 'admin',
    keyGenerator: (req) => req.admin?.id || getClientIdentifier(req)
});

/**
 * File uploads - 20 per hour (50 in development)
 */
export const uploadLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 50 : 20, // ✅ Higher in dev
    message: 'Upload limit exceeded. Try again later.',
    prefix: 'upload',
    keyGenerator: (req) => req.user?.id || req.admin?.id || getClientIdentifier(req)
});

/**
 * Password reset attempts - 5 per hour (15 in development)
 */
export const passwordResetLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 15 : 5, // ✅ Higher in dev
    message: 'Too many password reset attempts.',
    prefix: 'password-reset',
    keyGenerator: (req) => {
        const email = req.body?.email?.toLowerCase() || '';
        const clientIp = getClientIdentifier(req);
        return `${clientIp}:${email}`;
    }
});

// Export factory for custom limiters
export const createCustomLimiter = createRateLimiter;

// Export all limiters
export default {
    loginLimiter,
    otpLimiter,
    oauthLimiter,
    apiLimiter,
    registerLimiter,
    authenticatedLimiter,
    adminLimiter,
    uploadLimiter,
    passwordResetLimiter,
    createCustomLimiter
};