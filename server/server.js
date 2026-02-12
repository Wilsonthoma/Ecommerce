import app from './app.js';
import mongoose from 'mongoose';
import colors from 'colors';
import { createServer } from 'http';

// Import configuration and utilities
import config from './config/env.js';
import { connectDB, checkConnection } from './config/database.js';
import logger from './utils/logger.js';
import { testResendConnection } from './config/resend.js'; // ✅ ADDED Resend test
import cache from './utils/cache.js';

// ==================== UNCAUGHT EXCEPTIONS ====================
process.on('uncaughtException', (err) => {
    console.error('\n❌ UNCAUGHT EXCEPTION!'.red.bold);
    console.error(`   Name: ${err.name}`.red);
    console.error(`   Message: ${err.message}`.red);
    console.error(`   Stack: ${err.stack}`.red);
    
    logger.error('UNCAUGHT EXCEPTION!', err);
    process.exit(1);
});

// ==================== CONNECT TO DATABASE ====================
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        
        // ✅ TEST RESEND CONNECTION (replaces Brevo)
        try {
            const resendTest = await testResendConnection();
            if (resendTest.connected) {
                console.log('✅ Resend email service ready'.green);
            } else {
                console.log('⚠️  Resend email service not available'.yellow);
            }
        } catch (error) {
            console.log('⚠️  Resend email test skipped'.yellow);
        }
        
        // Create HTTP server
        const server = createServer(app);
        
        // ==================== PORT CONFIGURATION ====================
        const PORT = config.server.port || 5000;
        const NODE_ENV = config.server.env || 'development';
        
        // ==================== GRACEFUL SHUTDOWN ====================
        const gracefulShutdown = async (signal) => {
            console.log(`
╔══════════════════════════════════════════════════════════╗
║                 GRACEFUL SHUTDOWN INITIATED              ║
╠══════════════════════════════════════════════════════════╣
║  Signal: ${signal.padEnd(45)} ║
║  Time:   ${new Date().toLocaleString().padEnd(45)} ║
╚══════════════════════════════════════════════════════════╝
            `.yellow);
            
            if (server.listening) {
                server.close(async () => {
                    logger.info('✅ HTTP server closed');
                    
                    if (mongoose.connection.readyState === 1) {
                        await mongoose.connection.close();
                        logger.info('🔒 Database connection closed');
                    }
                    
                    logger.info('👋 Graceful shutdown complete');
                    process.exit(0);
                });
                
                setTimeout(() => {
                    logger.error('❌ Could not close connections in time, forcefully shutting down');
                    process.exit(1);
                }, 10000);
            }
        };
        
        // ==================== START SERVER ====================
        server.listen(PORT, async () => {
            // Display server status
            console.log(`
${'═'.repeat(60).cyan}
${'🚀  KWETUSHOP ADMIN DASHBOARD BACKEND'.cyan.bold}
${'═'.repeat(60).cyan}

  ${'📊 Environment:'.cyan}     ${NODE_ENV.green}
  ${'🌐 Server:'.cyan}         ${`http://localhost:${PORT}`.green}
  ${'📡 API Base:'.cyan}      ${`http://localhost:${PORT}/api`.green}
  ${'🕒 Started:'.cyan}       ${new Date().toLocaleString().green}
  
  ${'🔗 Quick Links:'.cyan}
  ${'├── API Root:'.yellow}        ${`http://localhost:${PORT}/`.cyan}
  ${'├── Health Check:'.yellow}    ${`http://localhost:${PORT}/api/health`.cyan}
  ${'├── CSRF Token:'.yellow}      ${`http://localhost:${PORT}/api/csrf-token`.cyan}
  ${'├── Auth Routes:'.yellow}     ${`http://localhost:${PORT}/api/auth`.cyan}
  ${'└── Admin Routes:'.yellow}    ${`http://localhost:${PORT}/api/admin`.cyan}
  
${'═'.repeat(60).cyan}
            `);
            
            // Check admin setup
            try {
                const Admin = (await import('./models/Admin.js')).default;
                const adminCount = await Admin.countDocuments();
                if (adminCount === 0) {
                    console.log('⚠️  No admin users found. Please run setup.'.yellow);
                } else {
                    console.log(`✅ ${adminCount} admin user(s) found`.green);
                }
            } catch (error) {
                logger.warn('⚠️  Could not check admin status', { error: error.message });
            }
        });
        
        // ==================== PROCESS EVENT HANDLERS ====================
        process.on('unhandledRejection', (err) => {
            console.error('\n❌ UNHANDLED REJECTION!'.red.bold);
            console.error(`   Name: ${err.name}`.red);
            console.error(`   Message: ${err.message}`.red);
            logger.error('UNHANDLED REJECTION!', err);
        });
        
        process.on('SIGTERM', () => {
            logger.info('👋 SIGTERM received');
            gracefulShutdown('SIGTERM');
        });
        
        process.on('SIGINT', () => {
            logger.info('👋 SIGINT received');
            gracefulShutdown('SIGINT');
        });
        
        process.on('SIGUSR2', () => {
            logger.info('👋 SIGUSR2 received (nodemon restart)');
            if (server.listening) {
                server.close(() => {
                    logger.info('✅ HTTP server closed for restart');
                    process.exit(0);
                });
            }
        });
        
        return server;
        
    } catch (error) {
        console.error(`❌ Failed to start server: ${error.message}`.red.bold);
        logger.error('Failed to start server', error);
        process.exit(1);
    }
};

// Start the server
const server = await startServer();

export { server };