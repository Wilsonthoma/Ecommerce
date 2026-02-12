import mongoose from 'mongoose';
import colors from 'colors';
import config from './env.js';

// Register connection event listeners once
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to DB'.cyan);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose connection error: ${err.message}`.red);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from DB'.yellow);
});

// ✅ FIXED: REMOVED cleanup handlers from HERE
// Let server.js handle process termination exclusively
// DO NOT add process.on('SIGINT') or process.on('SIGTERM') here!

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    const dbConfig = config.database;

    if (!dbConfig.uri) {
      throw new Error('DB_URI environment variable is not set');
    }

    const options = {
      ...dbConfig.options,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    const conn = await mongoose.connect(dbConfig.uri, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.green.bold);
    console.log(`📊 Database: ${conn.connection.name}`.green);
    console.log(`🔗 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`.cyan);
    console.log(`🌐 Environment: ${config.server.env}`.blue);
    console.log(`🚀 API Prefix: ${config.server.apiPrefix}`.blue);
    console.log(`📱 Frontend: ${config.server.frontendUrl}`.blue);
    console.log(`🖥️  Admin: ${config.server.adminUrl}`.blue);

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`.red.bold);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Tips:'.yellow);
      console.error('1. Make sure MongoDB is running'.yellow);
      console.error(`2. Check your DB_URI: ${config.database.uri ? 'Set' : 'Not set'}`.yellow);
      console.error('3. Verify network connectivity'.yellow);
    }
    
    process.exit(1);
  }
};

/**
 * Check database connection status
 * @returns {Object} Connection status
 */
export const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const status = {
    state: states[state] || 'unknown',
    readyState: state,
    isConnected: state === 1,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.connection.models),
    environment: config.server.env,
    timestamp: new Date().toISOString()
  };

  return status;
};

/**
 * ✅ FIXED: Keep closeConnection but DON'T call it from process handlers
 * Only exported for explicit use (like seeder scripts, not main app)
 */
export const closeConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔒 Database connection closed gracefully'.yellow);
    }
  } catch (error) {
    console.error(`❌ Error closing database connection: ${error.message}`.red);
    throw error;
  }
};

// ✅ FIXED: Remove all process.on handlers from here!
// They belong ONLY in server.js

export default {
  connectDB,
  checkConnection,
  closeConnection,
  connection: mongoose.connection
};