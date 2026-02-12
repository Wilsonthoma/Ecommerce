import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log formats
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: fileFormat,
  transports: [
    // Error logs
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    }),
    
    // Combined logs
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    }),
    
    // Audit logs (for important business events)
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '20m',
      maxFiles: '90d',
      zippedArchive: true
    })
  ]
});

// Console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
} else {
  // In production, only log warnings and errors to console
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'warn'
  }));
}

// Logging utility functions
export const log = {
  // Standard logging
  info: (message, meta = {}) => logger.info(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  error: (message, error = null, meta = {}) => {
    if (error instanceof Error) {
      meta.stack = error.stack;
      meta.errorMessage = error.message;
      meta.errorName = error.name;
    }
    logger.error(message, meta);
  },
  debug: (message, meta = {}) => logger.debug(message, meta),
  
  // Business event logging
  audit: (event, userId, action, details = {}) => {
    logger.info('AUDIT', {
      event,
      userId,
      action,
      timestamp: new Date().toISOString(),
      ip: details.ip,
      userAgent: details.userAgent,
      ...details
    });
  },
  
  // Performance logging
  performance: (operation, duration, meta = {}) => {
    logger.info('PERFORMANCE', {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...meta
    });
  },
  
  // Security logging
  security: (event, level = 'info', details = {}) => {
    const logLevel = level === 'critical' ? 'error' : level;
    logger[logLevel](`SECURITY: ${event}`, {
      securityEvent: event,
      level,
      timestamp: new Date().toISOString(),
      ...details
    });
  },
  
  // HTTP request logging
  http: (req, res, responseTime) => {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    };
    
    // Log errors (4xx, 5xx) as errors, others as info
    if (res.statusCode >= 400) {
      logger.error('HTTP Request Error', meta);
    } else {
      logger.info('HTTP Request', meta);
    }
  },
  
  // Database query logging
  query: (operation, collection, duration, query = {}) => {
    logger.debug('DATABASE QUERY', {
      operation,
      collection,
      duration,
      timestamp: new Date().toISOString(),
      query: JSON.stringify(query)
    });
  },
  
  // Get logger stream for Express Morgan
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log response when finished
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    log.http(req, res, responseTime);
  });
  
  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  log.error('Unhandled Error', err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id
  });
  
  next(err);
};

export default logger;