import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import colors from 'colors';

// Get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const projectRoot = path.resolve(__dirname, '..', '..');
const envPath = path.resolve(projectRoot, envFile);

dotenv.config({ path: envPath });

class EnvironmentConfig {
  constructor() {
    this.validate();
  }

  validate() {
    const required = ['DB_URI', 'JWT_SECRET', 'SESSION_SECRET'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      console.error(`❌ Missing required environment variables: ${missing.join(', ')}`.red);
      process.exit(1);
    }

    const allowedEnvs = ['development', 'production', 'test'];
    if (!allowedEnvs.includes(process.env.NODE_ENV)) {
      console.warn(`⚠️  NODE_ENV=${process.env.NODE_ENV} is invalid. Defaulting to development`.yellow);
      process.env.NODE_ENV = 'development';
    }

    const port = parseInt(process.env.PORT || '5000');
    process.env.PORT = (!isNaN(port) && port > 0 && port < 65536 ? port : 5000).toString();

    if (!process.env.JWT_EXPIRE) process.env.JWT_EXPIRE = '7d';
    if (!process.env.MAX_FILE_SIZE || isNaN(parseInt(process.env.MAX_FILE_SIZE))) process.env.MAX_FILE_SIZE = '5';
    if (!process.env.GOOGLE_CLIENT_ID) console.warn('⚠️  GOOGLE_CLIENT_ID not set. Google OAuth will not work.'.yellow);
    if (!process.env.GOOGLE_CLIENT_SECRET) console.warn('⚠️  GOOGLE_CLIENT_SECRET not set. Google OAuth will not work.'.yellow);

    console.log(`✅ Environment: ${process.env.NODE_ENV}`.green);
  }

  get all() {
    return {
      // Server
      port: parseInt(process.env.PORT),
      nodeEnv: process.env.NODE_ENV,
      
      // Database
      dbUri: process.env.DB_URI,
      dbName: process.env.DB_NAME || 'ecommerce',
      
      // Authentication
      jwtSecret: process.env.JWT_SECRET,
      jwtExpire: process.env.JWT_EXPIRE,
      jwtCookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 7,
      sessionSecret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
      
      // OAuth
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
      googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      
      // CORS
      corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://localhost:3000')
        .split(',')
        .map(url => url.trim()),
      
      // File Uploads
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5,
      
      // API
      apiPrefix: process.env.API_PREFIX || '/api',
      apiVersion: process.env.API_VERSION || 'v1',
      
      // Frontend URLs
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      adminUrl: process.env.ADMIN_URL || 'http://localhost:5174',
      
      // Email (optional)
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
      
      // Redis (optional)
      redisUrl: process.env.REDIS_URL,
    };
  }

  get server() {
    return {
      port: this.all.port,
      env: this.all.nodeEnv,
      apiPrefix: this.all.apiPrefix,
      apiVersion: this.all.apiVersion,
      frontendUrl: this.all.frontendUrl,
      adminUrl: this.all.adminUrl
    };
  }

  get database() {
    return {
      uri: this.all.dbUri,
      name: this.all.dbName,
      options: {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      }
    };
  }

  get jwt() {
    return {
      secret: this.all.jwtSecret,
      expire: this.all.jwtExpire,
      cookieExpire: this.all.jwtCookieExpire
    };
  }

  get session() {
    return {
      secret: this.all.sessionSecret,
      cookie: {
        maxAge: 20 * 60 * 1000, // 20 minutes
        secure: this.isProduction(),
        httpOnly: true,
        sameSite: this.isProduction() ? 'none' : 'lax'
      }
    };
  }

  get oauth() {
    return {
      google: {
        clientId: this.all.googleClientId,
        clientSecret: this.all.googleClientSecret,
        callbackUrl: this.all.googleCallbackUrl
      }
    };
  }

  get cors() {
    return {
      origins: this.all.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Origin']
    };
  }

  get uploads() {
    return {
      maxSize: this.all.maxFileSize * 1024 * 1024, // Convert MB to bytes
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    };
  }

  isDevelopment() {
    return this.all.nodeEnv === 'development';
  }
  
  isProduction() {
    return this.all.nodeEnv === 'production';
  }
  
  isTest() {
    return this.all.nodeEnv === 'test';
  }
}

const config = new EnvironmentConfig();
export default config;