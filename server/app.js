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
        req.path.includes('/webhook') ||
        req.path.includes('/debug')) {  // Allow debug endpoints
        return next();
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return csrfProtection(req, res, next);
    }
    next();
});

// CSRF Token endpoint
app.get('/api/csrf-token', getCsrfToken);

// ==================== ✅ FIXED: STATIC FILES WITH SUBFOLDER SUPPORT ====================
// Serve static files from main uploads directory (this automatically serves subfolders)
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

// Explicitly serve products subfolder (redundant but safe)
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

// ==================== API ROUTES ====================
// Mount all routes through index router
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

// ==================== ENHANCED DEBUG ENDPOINTS ====================
if (config.isDevelopment?.() || process.env.NODE_ENV === 'development') {
    
    // 🆕 ENHANCED: Uploads debug endpoint with subfolder support
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
            
            // Check main uploads folder
            const files = fs.readdirSync(uploadsPath);
            
            // Check products subfolder
            const productsPath_check = path.join(uploadsPath, 'products');
            const productsExists = fs.existsSync(productsPath_check);
            let productFiles = [];
            
            if (productsExists) {
                productFiles = fs.readdirSync(productsPath_check);
            }
            
            // Get file stats for main folder
            const fileDetails = files.slice(0, 20).map(filename => {
                const filePath = path.join(uploadsPath, filename);
                try {
                    const stats = fs.statSync(filePath);
                    return {
                        name: filename,
                        size: stats.size,
                        isFile: stats.isFile(),
                        isDirectory: stats.isDirectory(),
                        created: stats.birthtime,
                        modified: stats.mtime,
                        url: `/uploads/${filename}`,
                        fullUrl: `http://localhost:${config.server?.port || 5000}/uploads/${filename}`
                    };
                } catch (err) {
                    return {
                        name: filename,
                        error: err.message
                    };
                }
            });
            
            // Get stats for product files
            const productDetails = productFiles.slice(0, 20).map(filename => {
                const filePath = path.join(productsPath_check, filename);
                try {
                    const stats = fs.statSync(filePath);
                    return {
                        name: filename,
                        size: stats.size,
                        isFile: stats.isFile(),
                        created: stats.birthtime,
                        modified: stats.mtime,
                        url: `/uploads/products/${filename}`,
                        fullUrl: `http://localhost:${config.server?.port || 5000}/uploads/products/${filename}`
                    };
                } catch (err) {
                    return {
                        name: filename,
                        error: err.message
                    };
                }
            });
            
            // Check for specific product image
            const specificImage = 'screenshot-from-2026-01-11-20-54-58-1770967558948-9d92599d.png';
            const specificImagePath = path.join(uploadsPath, 'products', specificImage);
            const specificImageExists = fs.existsSync(specificImagePath);
            
            res.json({
                success: true,
                message: 'Uploads folder structure',
                path: uploadsPath,
                exists: true,
                mainFolder: {
                    fileCount: files.length,
                    files: fileDetails
                },
                productsSubfolder: {
                    exists: productsExists,
                    path: productsPath_check,
                    fileCount: productFiles.length,
                    files: productDetails
                },
                yourSpecificImage: {
                    filename: specificImage,
                    exists: specificImageExists,
                    path: specificImagePath,
                    url: `/uploads/products/${specificImage}`,
                    fullUrl: `http://localhost:${config.server?.port || 5000}/uploads/products/${specificImage}`,
                    size: specificImageExists ? fs.statSync(specificImagePath).size : null
                },
                testYourImage: productFiles.length > 0 ? {
                    filename: productFiles[0],
                    url: `/uploads/products/${productFiles[0]}`,
                    fullUrl: `http://localhost:${config.server?.port || 5000}/uploads/products/${productFiles[0]}`
                } : null
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                path: uploadsPath
            });
        }
    });

    // 🆕 Test specific product image endpoint
    app.get('/api/debug/product-image/:filename?', (req, res) => {
        const filename = req.params.filename || 'screenshot-from-2026-01-11-20-54-58-1770967558948-9d92599d.png';
        const imagePath = path.join(uploadsPath, 'products', filename);
        const productsFolder = path.join(uploadsPath, 'products');
        
        const response = {
            success: false,
            searchedFile: filename,
            searchedPath: imagePath,
            uploadsPath: uploadsPath,
            productsPath: productsFolder,
            productsExists: fs.existsSync(productsFolder),
            fileExists: fs.existsSync(imagePath)
        };
        
        if (fs.existsSync(productsFolder)) {
            response.productsFiles = fs.readdirSync(productsFolder).slice(0, 10);
        }
        
        if (fs.existsSync(imagePath)) {
            const stats = fs.statSync(imagePath);
            response.success = true;
            response.message = 'Product image found';
            response.fileSize = stats.size;
            response.url = `/uploads/products/${filename}`;
            response.fullUrl = `http://localhost:${config.server?.port || 5000}/uploads/products/${filename}`;
        }
        
        res.json(response);
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
                maxAge: config.session?.cookie?.maxAge || 1200000,
                secure: config.session?.cookie?.secure || false
            }
        };
        res.json({ success: true, config: safeConfig });
    });

    // Test endpoint
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