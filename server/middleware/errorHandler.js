// server/middleware/errorHandler.js
import colors from 'colors';

// Main error handler
export const errorHandler = (err, req, res, next) => {
    // Log error with context
    console.error(colors.red('❌ Error Details:'), {
        message: err.message,
        name: err.name,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Security: Don't expose stack traces in production
    const isProduction = process.env.NODE_ENV === 'production';
    
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = null;

    // Handle specific error types
    
    // Mongoose CastError (Invalid ObjectId)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = `Resource not found with ID of ${err.value}`;
    }
    
    // Mongoose ValidationError
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        errors = Object.values(err.errors).map(val => val.message);
    }
    
    // Mongoose duplicate key
    else if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate field value: ${field}. Please use another value.`;
    }
    
    // JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    
    // Authentication errors
    else if (err.name === 'UnauthorizedError' || err.name === 'Unauthorized') {
        statusCode = 401;
        message = 'Authentication required';
    }
    
    // Rate limiting
    else if (err.code === 'LIMIT_REQUEST') {
        statusCode = 429;
        message = 'Too many requests';
    }
    
    // CSRF errors
    else if (err.name === 'CSRFTokenError') {
        statusCode = 403;
        message = 'Invalid CSRF token';
    }
    
    // OAuth specific errors
    else if (err.message.includes('OAuth') || err.message.includes('Google')) {
        statusCode = 400;
        message = isProduction ? 'Authentication failed' : err.message;
    }

    // Construct response
    const errorResponse = {
        success: false,
        message: isProduction && statusCode === 500 ? 'Internal Server Error' : message,
        ...(errors && { errors }),
        ...(!isProduction && { 
            stack: err.stack,
            type: err.name,
            code: err.code
        })
    };

    // Clear sensitive data in production
    if (isProduction) {
        delete errorResponse.stack;
        delete errorResponse.type;
        delete errorResponse.code;
    }

    res.status(statusCode).json(errorResponse);
};

// OAuth Error Handler for redirects
export const handleOAuthError = (error, req, res) => {
    console.error(colors.red('❌ OAuth Error:'), error);
    
    const errorMap = {
        'access_denied': 'Authentication cancelled by user',
        'invalid_state': 'Security validation failed',
        'no_code': 'Authentication incomplete',
        'token_expired': 'Authentication session expired',
        'invalid_token': 'Invalid authentication token',
        'user_exists': 'Account already exists with different method',
        'auth_failed': 'Authentication failed',
        'user_cancelled': 'User cancelled authentication',
        'email_not_verified': 'Email not verified by Google'
    };

    const errorKey = error.message?.toLowerCase().replace(/ /g, '_') || 'oauth_failed';
    const message = errorMap[errorKey] || 'Authentication failed';
    
    console.log(`Redirecting to frontend with error: ${errorKey}`);
    
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorKey}`);
};

// Async error wrapper for controllers
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Not Found middleware
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

export default {
    errorHandler,
    handleOAuthError,
    asyncHandler,
    notFound
};