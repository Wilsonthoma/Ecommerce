import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';
import colors from 'colors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import configuration
import config from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { loginLimiter, otpLimiter, apiLimiter, oauthLimiter } from './middleware/rateLimiters.js';
import { csrfProtection, getCsrfToken } from './config/csrfProtection.js';
import logger from './utils/logger.js'; // ✅ FIXED: Single import

// Import routers
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import indexRouter from './routes/index.js';

// Load environment variables
dotenv.config();

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path for static uploads
const uploadsPath = path.join(__dirname, 'uploads');

const app = express();

// ==================== REQUEST LOGGING ====================
if (config.isDevelopment()) {
    app.use((req, res, next) => {
        console.log(`📥 ${req.method} ${req.url}`.cyan);
        next();
    });
}

// ==================== BODY PARSERS ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ==================== HTTP LOGGING ====================
if (config.isDevelopment()) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { 
        stream: logger.stream || { write: (msg) => console.log(msg.trim()) } 
    }));
}

// ==================== SECURITY HEADERS ====================
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    })
);

// ==================== CORS CONFIGURATION ====================
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:5175',
    config.server.frontendUrl,
    config.server.adminUrl
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || config.isDevelopment()) {
                callback(null, true);
            } else {
                logger.warn?.(`CORS blocked origin: ${origin}`) || console.warn(`⚠️ CORS blocked: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-CSRF-Token',
            'X-Requested-With',
            'Accept',
            'Origin'
        ],
        exposedHeaders: ['Content-Length', 'Authorization', 'X-CSRF-Token'],
        maxAge: 86400
    })
);

app.options('*', cors());

// ==================== SECURITY MIDDLEWARE ====================
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// ==================== SESSION MANAGEMENT ====================
app.use(session({
    secret: config.session?.secret || process.env.SESSION_SECRET || 'kwetushop-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 20 * 60 * 1000, // 20 minutes
        secure: config.isProduction?.() || process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: config.isProduction?.() || process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    },
    name: 'kwetu.sid',
    rolling: true
}));

// Session debugging (development only)
if (config.isDevelopment?.() || process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log('📊 Session Status:'.cyan, {
            path: req.path,
            sessionID: req.sessionID,
            sessionExists: !!req.session,
            sessionKeys: req.session ? Object.keys(req.session) : 'none',
            maxAge: req.session?.cookie?.maxAge
        });
        next();
    });
}

// ==================== RATE LIMITING ====================
app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);
app.use('/api/auth/send-verify-otp', otpLimiter);
app.use('/api/auth/send-reset-otp', otpLimiter);
app.use('/api/auth/google', oauthLimiter);
app.use('/api/auth/google/callback', oauthLimiter);

// ==================== CSRF PROTECTION ====================
// CSRF Protection for state-changing methods
app.use('/api', (req, res, next) => {
    // Skip CSRF for OAuth callbacks and public endpoints
    if (req.path.includes('/auth/google/callback') ||
        req.path.includes('/health') ||
        req.path.includes('/csrf-token') ||
        req.path.includes('/webhook')) {
        return next();
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return csrfProtection(req, res, next);
    }
    next();
});

// CSRF Token endpoint
app.get('/api/csrf-token', getCsrfToken);

// ==================== STATIC FILES ====================
app.use('/uploads', express.static(uploadsPath, {
    maxAge: config.isProduction?.() ? '30d' : 0,
    etag: true,
    lastModified: true
}));

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown';
    
    res.status(200).json({
        success: true,
        message: '🚀 Server is healthy',
        timestamp: new Date().toISOString(),
        environment: config.server?.env || process.env.NODE_ENV || 'development',
        database: {
            status: dbStatus,
            state: dbState,
            host: mongoose.connection.host || 'N/A',
            name: mongoose.connection.name || 'N/A'
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
    });
});

// ==================== API ROUTES ====================
// Mount all routes through index router (SINGLE SOURCE OF TRUTH)
app.use('/api', indexRouter);

// Legacy route support (temporary - will be removed after confirming index router works)
// Comment these out once you verify index router is working
// app.use('/api/auth', authRouter);
// app.use('/api/user', userRouter);

// ==================== ROOT ENDPOINT ====================
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 KwetuShop API is running',
        version: process.env.npm_package_version || '1.0.0',
        environment: config.server?.env || process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        documentation: '/api',
        health: '/api/health',
        auth: '/api/auth',
        csrf: '/api/csrf-token',
        endpoints: {
            products: '/api/products',
            categories: '/api/categories',
            cart: '/api/cart',
            admin: '/api/admin'
        }
    });
});

// ==================== DEBUG ENDPOINTS (DEVELOPMENT ONLY) ====================
if (config.isDevelopment?.() || process.env.NODE_ENV === 'development') {
    app.get('/api/debug/routes', (req, res) => {
        const routes = [];

        const extractRoutes = (stack, prefix = '') => {
            if (!stack) return;
            
            stack.forEach((layer) => {
                if (layer.route) {
                    const methods = Object.keys(layer.route.methods)
                        .map(m => m.toUpperCase())
                        .join(', ');
                    const path = prefix + layer.route.path;
                    routes.push({ 
                        method: methods, 
                        path,
                        stack: layer.route.stack?.length || 0
                    });
                } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
                    extractRoutes(layer.handle.stack, prefix);
                }
            });
        };

        try {
            extractRoutes(app._router?.stack || []);
        } catch (error) {
            console.error('Error extracting routes:', error);
        }

        res.json({
            success: true,
            message: 'Available API routes',
            totalRoutes: routes.length,
            routes: routes.sort((a, b) => a.path.localeCompare(b.path))
        });
    });

    app.get('/api/debug/config', (req, res) => {
        const safeConfig = {
            environment: config.server?.env || process.env.NODE_ENV,
            database: {
                name: config.database?.name || process.env.DB_NAME,
                host: mongoose.connection.host || 'N/A'
            },
            cors: {
                origins: allowedOrigins,
                credentials: true
            },
            uploads: {
                maxSize: config.uploads?.maxSize || '10mb',
                path: uploadsPath
            },
            session: {
                maxAge: config.session?.cookie?.maxAge || 1200000,
                secure: config.session?.cookie?.secure || false
            }
        };
        res.json({ success: true, config: safeConfig });
    });

    // Test endpoint for checking server status
    app.get('/api/test', (req, res) => {
        res.json({
            success: true,
            message: '✅ API test endpoint is working',
            timestamp: new Date().toISOString(),
            environment: config.server?.env || process.env.NODE_ENV,
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        });
    });
}

// ==================== 404 HANDLER ====================
// Catch-all for undefined routes
app.all('*', (req, res, next) => {
    const err = new Error(`Cannot find ${req.method} ${req.originalUrl} on this server`);
    err.statusCode = 404;
    err.code = 'ROUTE_NOT_FOUND';
    next(err);
});

// ==================== ERROR HANDLING ====================
// 404 handler - MUST be after all routes
app.use(notFound);

// Global error handler - MUST be last
app.use(errorHandler);

export default app;