// backend/app.js - COMPLETE FIXED VERSION WITH ALL CORRECTIONS
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
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

// Import configuration
import config from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { loginLimiter, otpLimiter, apiLimiter, oauthLimiter } from './middleware/rateLimiters.js';
import { csrfProtection, getCsrfToken } from './config/csrfProtection.js';
import logger from './utils/logger.js';

// Import routers
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import indexRouter from './routes/index.js';

// Load environment variables
dotenv.config();

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== UPLOADS PATH CONFIGURATION ====================
// Check multiple possible uploads locations
const possiblePaths = [
    path.join(__dirname, 'uploads'),                    // server/uploads
    path.join(__dirname, '..', 'uploads'),              // project-root/uploads
    path.join(process.cwd(), 'uploads'),                // current working directory/uploads
    path.join(process.cwd(), 'server', 'uploads')       // cwd/server/uploads
];

let uploadsPath = null;
for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
        uploadsPath = testPath;
        console.log(`📁 Found uploads folder at: ${uploadsPath}`.green);
        break;
    }
}

// If no uploads folder found, create one in server directory
if (!uploadsPath) {
    uploadsPath = path.join(__dirname, 'uploads');
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log(`📁 Created uploads folder at: ${uploadsPath}`.yellow);
}

// Create products subfolder if it doesn't exist
const productsPath = path.join(uploadsPath, 'products');
if (!fs.existsSync(productsPath)) {
    fs.mkdirSync(productsPath, { recursive: true });
    console.log(`📁 Created products subfolder at: ${productsPath}`.green);
}

console.log(`📁 Final uploads path: ${uploadsPath}`.cyan);
console.log(`📁 Products subfolder: ${productsPath}`.cyan);
console.log(`📁 Uploads folder exists: ${fs.existsSync(uploadsPath)}`.cyan);
console.log(`📁 Products folder exists: ${fs.existsSync(productsPath)}`.cyan);

// List files in uploads folder for debugging
try {
    const files = fs.readdirSync(uploadsPath);
    console.log(`📁 Files in uploads (${files.length}):`.cyan);
    files.slice(0, 5).forEach(file => console.log(`   - ${file}`.gray));
    if (files.length > 5) console.log(`   ... and ${files.length - 5} more`.gray);
    
    // List files in products subfolder
    if (fs.existsSync(productsPath)) {
        const productFiles = fs.readdirSync(productsPath);
        console.log(`📁 Files in products (${productFiles.length}):`.cyan);
        productFiles.slice(0, 5).forEach(file => console.log(`   - ${file}`.gray));
        if (productFiles.length > 5) console.log(`   ... and ${productFiles.length - 5} more`.gray);
    }
} catch (err) {
    console.log(`📁 Could not read uploads folder: ${err.message}`.yellow);
}

const app = express();

// ==================== REQUEST LOGGING ====================
if (config.isDevelopment?.() || process.env.NODE_ENV === 'development') {
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
if (config.isDevelopment?.() || process.env.NODE_ENV === 'development') {
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
    config.server?.frontendUrl,
    config.server?.adminUrl
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || config.isDevelopment?.()) {
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

// ==================== ✅ FIXED: SESSION MANAGEMENT WITH ALL CORRECTIONS ====================
const sessionConfig = {
    secret: process.env.SESSION_SECRET || '9771ea993cb28fde5e239b22a2d3d98abb0d197917c8e8ca15df65df31e169c8',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 20 * 60 * 1000, // 20 minutes
        secure: false, // Set to false for development (HTTP)
        httpOnly: true,
        sameSite: 'lax', // Use 'lax' for development
        domain: 'localhost' // Added domain for localhost
    },
    name: 'kwetu.sid',
    rolling: true,
    proxy: true // Added proxy for localhost
};

// Use MongoDB for session store
try {
    sessionConfig.store = MongoStore.create({
        mongoUrl: process.env.DB_URI || process.env.MONGODB_URI,
        ttl: 20 * 60, // 20 minutes in seconds
        autoRemove: 'native',
        touchAfter: 24 * 3600 // lazy session update
    });
    console.log('📦 Using MongoDB session store'.green);
} catch (error) {
    console.log('⚠️ Could not connect to MongoDB for sessions, using memory store'.yellow);
}

app.use(session(sessionConfig));

// ✅ ADDED: Comprehensive cookie debugging middleware
app.use((req, res, next) => {
    console.log('🍪 Complete Cookie Debug:', {
        path: req.path,
        headers: req.headers.cookie,
        signedCookies: req.signedCookies,
        cookies: req.cookies,
        sessionID: req.sessionID,
        sessionExists: !!req.session,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        hasOAuthState: req.session ? !!req.session.oauthState : false,
        sessionStore: req.sessionStore ? 'configured' : 'missing'
    });
    next();
});

// ✅ Enhanced session debugging middleware
app.use((req, res, next) => {
    if (req.path.includes('/auth/google') || req.path.includes('/debug/session') || req.path.includes('/auth/google/callback')) {
        console.log('📊 Session Debug (Auth):', {
            path: req.path,
            sessionID: req.sessionID,
            hasSession: !!req.session,
            sessionKeys: req.session ? Object.keys(req.session) : [],
            hasOAuthState: req.session ? !!req.session.oauthState : false,
            oauthState: req.session?.oauthState || null,
            cookies: req.headers.cookie
        });
    }
    next();
});

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
        req.path.includes('/webhook') ||
        req.path.includes('/debug')) {
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
// Serve static files from main uploads directory
app.use('/uploads', express.static(uploadsPath, {
    maxAge: config.isProduction?.() ? '30d' : 0,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        console.log(`📸 Serving static file: ${path.basename(filePath)}`.gray);
    }
}));

// Explicitly serve products subfolder
app.use('/uploads/products', express.static(path.join(uploadsPath, 'products'), {
    maxAge: config.isProduction?.() ? '30d' : 0,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
}));

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown';
    
    // Get uploads stats
    let uploadsStats = {
        path: uploadsPath,
        exists: fs.existsSync(uploadsPath),
        fileCount: 0,
        productsCount: 0
    };
    
    if (fs.existsSync(uploadsPath)) {
        try {
            uploadsStats.fileCount = fs.readdirSync(uploadsPath).length;
            const productsSubfolder = path.join(uploadsPath, 'products');
            if (fs.existsSync(productsSubfolder)) {
                uploadsStats.productsCount = fs.readdirSync(productsSubfolder).length;
            }
        } catch (err) {
            uploadsStats.error = err.message;
        }
    }
    
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
        uploads: uploadsStats,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
    });
});

// ==================== DEBUG ENDPOINTS (MUST COME BEFORE API ROUTES) ====================
if (config.isDevelopment?.() || process.env.NODE_ENV === 'development') {
    
    // ✅ Session debug endpoint
    app.get('/api/debug/session', (req, res) => {
        try {
            const sessionData = {
                sessionID: req.sessionID,
                sessionExists: !!req.session,
                sessionKeys: req.session ? Object.keys(req.session) : [],
                hasOAuthState: req.session ? !!req.session.oauthState : false,
                oauthState: req.session?.oauthState || null,
                cookie: req.session?.cookie,
                cookies: req.headers.cookie,
                signedCookies: req.signedCookies,
                sessionStore: req.sessionStore ? 'configured' : 'missing'
            };
            
            console.log('📊 Session Debug Endpoint Called:', sessionData);
            res.json({ 
                success: true, 
                message: 'Session debug info',
                data: sessionData,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Session debug error:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Uploads debug endpoint
    app.get('/api/debug/uploads', (req, res) => {
        try {
            const folderExists = fs.existsSync(uploadsPath);
            
            if (!folderExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Uploads folder not found',
                    path: uploadsPath,
                    possiblePaths: possiblePaths.map(p => ({
                        path: p,
                        exists: fs.existsSync(p)
                    }))
                });
            }
            
            const files = fs.readdirSync(uploadsPath);
            const productsPath_check = path.join(uploadsPath, 'products');
            const productsExists = fs.existsSync(productsPath_check);
            let productFiles = [];
            
            if (productsExists) {
                productFiles = fs.readdirSync(productsPath_check);
            }
            
            res.json({
                success: true,
                message: 'Uploads folder structure',
                path: uploadsPath,
                exists: true,
                mainFolder: {
                    fileCount: files.length,
                    files: files.slice(0, 20)
                },
                productsSubfolder: {
                    exists: productsExists,
                    path: productsPath_check,
                    fileCount: productFiles.length,
                    files: productFiles.slice(0, 20)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                path: uploadsPath
            });
        }
    });

    // Test endpoint
    app.get('/api/debug/test', (req, res) => {
        res.json({
            success: true,
            message: '✅ Debug endpoint is working',
            timestamp: new Date().toISOString(),
            sessionID: req.sessionID
        });
    });

    // Routes debug endpoint
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

    // Config debug endpoint
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
                path: uploadsPath,
                exists: fs.existsSync(uploadsPath),
                fileCount: fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath).length : 0,
                productsPath: path.join(uploadsPath, 'products'),
                productsExists: fs.existsSync(path.join(uploadsPath, 'products')),
                productsCount: fs.existsSync(path.join(uploadsPath, 'products')) ? 
                    fs.readdirSync(path.join(uploadsPath, 'products')).length : 0
            },
            session: {
                maxAge: sessionConfig.cookie.maxAge,
                secure: sessionConfig.cookie.secure,
                sameSite: sessionConfig.cookie.sameSite,
                domain: sessionConfig.cookie.domain,
                resave: sessionConfig.resave,
                saveUninitialized: sessionConfig.saveUninitialized,
                proxy: sessionConfig.proxy
            }
        };
        res.json({ success: true, config: safeConfig });
    });
}

// ==================== API ROUTES (THESE COME AFTER DEBUG ENDPOINTS) ====================
app.use('/api', indexRouter);

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
        uploads: '/uploads',
        debug: '/api/debug/uploads',
        endpoints: {
            products: '/api/products',
            categories: '/api/categories',
            cart: '/api/cart',
            admin: '/api/admin'
        }
    });
});

// ==================== 404 HANDLER ====================
app.all('*', (req, res, next) => {
    const err = new Error(`Cannot find ${req.method} ${req.originalUrl} on this server`);
    err.statusCode = 404;
    err.code = 'ROUTE_NOT_FOUND';
    next(err);
});

// ==================== ERROR HANDLING ====================
app.use(notFound);
app.use(errorHandler);

export default app;