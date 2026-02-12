import { body, query, param, header, validationResult } from 'express-validator';
import { log } from '../utils/logger.js';
import User from '../models/User.js';
import { isValidPhone } from '../utils/helpers.js';

// ---------------- CUSTOM VALIDATORS ----------------

/**
 * Password complexity checker with single error message
 */
const passwordComplexityRules = (field = 'password') => [
    body(field)
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .custom((value) => {
            const failures = [];
            
            if (!value.match(/[a-z]/)) failures.push('one lowercase letter');
            if (!value.match(/[A-Z]/)) failures.push('one uppercase letter');
            if (!value.match(/[0-9]/)) failures.push('one number');
            if (!value.match(/[^A-Za-z0-9]/)) failures.push('one special character');
            
            if (failures.length > 0) {
                throw new Error(`Password must contain: ${failures.join(', ')}.`);
            }
            return true;
        })
];

/**
 * Check if email already exists in database
 */
const isEmailUnique = (model, excludeId = null) => {
    return body('email')
        .custom(async (email) => {
            const query = { email: email.toLowerCase() };
            if (excludeId) {
                query._id = { $ne: excludeId };
            }
            const existing = await model.findOne(query);
            if (existing) {
                throw new Error('Email already registered');
            }
            return true;
        });
};

/**
 * Check if phone number already exists
 */
const isPhoneUnique = (model, excludeId = null) => {
    return body('phone')
        .optional()
        .custom(async (phone) => {
            if (!phone) return true;
            const query = { phone };
            if (excludeId) {
                query._id = { $ne: excludeId };
            }
            const existing = await model.findOne(query);
            if (existing) {
                throw new Error('Phone number already registered');
            }
            return true;
        });
};

// ---------------- EXISTING VALIDATION SCHEMAS ----------------

export const emailValidation = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .trim()
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('Email must be less than 255 characters')
        .customSanitizer(email => email.toLowerCase())
];

export const passwordValidation = passwordComplexityRules('password');

export const otpValidation = [
    body('otp')
        .notEmpty().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
        .isNumeric().withMessage('OTP must be numeric')
        .trim()
];

export const oauthStateValidation = [
    query('state')
        .notEmpty().withMessage('State parameter is required')
        .isLength({ min: 10 }).withMessage('Invalid state parameter')
];

export const oauthCallbackValidation = [
    query('code')
        .notEmpty().withMessage('Authorization code is required')
        .isLength({ min: 10 }).withMessage('Invalid authorization code'),
    query('state')
        .notEmpty().withMessage('State parameter is required')
        .isLength({ min: 10 }).withMessage('Invalid state parameter')
];

export const registerValidation = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s-']+$/).withMessage('Name can only contain letters, spaces, hyphens and apostrophes')
        .escape(),
    ...emailValidation,
    ...passwordValidation,
    body('phone')
        .optional()
        .custom(value => !value || isValidPhone(value)).withMessage('Invalid phone number format'),
    isEmailUnique(User),
    isPhoneUnique(User)
];

// ✅ FIXED: confirmNewPassword is now OPTIONAL!
export const resetPasswordValidation = [
    ...emailValidation,
    ...otpValidation,
    ...passwordComplexityRules('newPassword'),
    body('confirmNewPassword')
        .optional()  // ✅ Make it optional - frontend already validates
        .custom((value, { req }) => !value || value === req.body.newPassword)
        .withMessage('Passwords do not match')
];

// ---------------- NEW VALIDATION SCHEMAS ----------------

/**
 * User profile update validation
 */
export const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s-']+$/).withMessage('Name contains invalid characters'),
    body('phone')
        .optional()
        .custom(value => !value || isValidPhone(value)).withMessage('Invalid phone number format'),
    isEmailUnique(User, { fromRequest: true }),
    isPhoneUnique(User, { fromRequest: true })
];

/**
 * Product validation
 */
export const productValidation = [
    body('name')
        .notEmpty().withMessage('Product name is required')
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Product name must be between 3 and 100 characters'),
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0')
        .toFloat(),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isMongoId().withMessage('Invalid category ID'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a positive integer')
        .toInt(),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('images')
        .optional()
        .isArray().withMessage('Images must be an array'),
    body('images.*')
        .optional()
        .isURL().withMessage('Invalid image URL'),
    body('isFeatured')
        .optional()
        .isBoolean().withMessage('isFeatured must be a boolean')
        .toBoolean()
];

/**
 * Order validation
 */
export const orderValidation = [
    body('items')
        .notEmpty().withMessage('Order items are required')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID'),
    body('items.*.quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
        .toInt(),
    body('shippingAddress')
        .notEmpty().withMessage('Shipping address is required'),
    body('shippingAddress.street')
        .notEmpty().withMessage('Street address is required')
        .trim(),
    body('shippingAddress.city')
        .notEmpty().withMessage('City is required')
        .trim(),
    body('shippingAddress.state')
        .notEmpty().withMessage('State is required')
        .trim(),
    body('shippingAddress.zipCode')
        .notEmpty().withMessage('ZIP code is required')
        .trim(),
    body('shippingAddress.country')
        .notEmpty().withMessage('Country is required')
        .trim(),
    body('paymentMethod')
        .notEmpty().withMessage('Payment method is required')
        .isIn(['credit_card', 'paypal', 'cod', 'bank_transfer'])
        .withMessage('Invalid payment method')
];

/**
 * Pagination validation
 */
export const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt(),
    query('sort')
        .optional()
        .trim()
        .isString()
];

/**
 * Search validation
 */
export const searchValidation = [
    query('q')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Search query must be between 2 and 100 characters')
        .escape(),
    query('category')
        .optional()
        .isMongoId().withMessage('Invalid category ID'),
    query('minPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number')
        .toFloat(),
    query('maxPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number')
        .toFloat()
        .custom((value, { req }) => {
            if (req.query?.minPrice && value < parseFloat(req.query.minPrice)) {
                throw new Error('Maximum price must be greater than minimum price');
            }
            return true;
        })
];

/**
 * ID parameter validation
 */
export const idParamValidation = [
    param('id')
        .notEmpty().withMessage('ID parameter is required')
        .isMongoId().withMessage('Invalid ID format')
];

/**
 * API key validation
 */
export const apiKeyValidation = [
    header('x-api-key')
        .notEmpty().withMessage('API key is required')
        .isLength({ min: 32, max: 64 }).withMessage('Invalid API key format')
];

/**
 * Refresh token validation
 */
export const refreshTokenValidation = [
    body('refreshToken')
        .notEmpty().withMessage('Refresh token is required')
        .isJWT().withMessage('Invalid token format')
];

// ---------------- ENHANCED ERROR HANDLING ----------------

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
        return next();
    }
    
    const extractedErrors = errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: process.env.NODE_ENV === 'development' ? err.value : undefined
    }));

    // Log validation errors in development
    if (process.env.NODE_ENV === 'development') {
        log?.debug?.('Validation failed', {
            path: req.path,
            method: req.method,
            errors: extractedErrors,
            body: req.body,
            query: req.query,
            params: req.params
        });
    }

    const firstError = extractedErrors[0];
    
    let message;
    if (process.env.NODE_ENV === 'production') {
        if (firstError.field === 'password' || firstError.field === 'newPassword') {
            message = 'Password does not meet security requirements';
        } else if (firstError.field === 'email') {
            message = 'Please provide a valid email address';
        } else {
            message = firstError.message;
        }
    } else {
        message = firstError.message;
    }

    const response = {
        success: false,
        message,
        code: 'VALIDATION_ERROR'
    };

    if (process.env.NODE_ENV === 'development') {
        response.field = firstError.field;
        response.errors = extractedErrors;
    }

    return res.status(400).json(response);
};

// ---------------- EXPORT ALL ----------------

export default {
    emailValidation,
    passwordValidation,
    otpValidation,
    registerValidation,
    resetPasswordValidation,
    updateProfileValidation,
    oauthStateValidation,
    oauthCallbackValidation,
    productValidation,
    orderValidation,
    paginationValidation,
    searchValidation,
    idParamValidation,
    apiKeyValidation,
    refreshTokenValidation,
    passwordComplexityRules,
    isEmailUnique,
    isPhoneUnique,
    validate
};