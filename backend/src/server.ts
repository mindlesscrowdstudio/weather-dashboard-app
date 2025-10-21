// backend/src/server.ts
import dotenv from 'dotenv';
// Load environment variables from .env file BEFORE any other imports
dotenv.config();

import app from './app';
import pool from './config/database';

const PORT = process.env.PORT || 3001;

let server: import('http').Server;

async function startServer() {
  try {
    // Ensure a database connection is established on startup
    console.log(' Testing database connection...');
    const result = await pool.query('SELECT NOW() as time, 1 as test');
    console.log('✅ Database connection successful.', result.rows[0]);

    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log('📡 Server ready to accept connections...');
    });

    // Add error handler for server
    server.on('error', (error) => {
      console.error('Server error:', error);
    });

    server.on('close', () => {
      console.log('Server closed');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🔌 Shutting down gracefully...');
  server?.close(async () => {
    console.log('✅ Server closed.');
    await pool.end();
    console.log('Database pool closed.');
    process.exit(0);
  });
};

// Handle process events
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Add debugging for unhandled rejections/exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
});

startServer();
