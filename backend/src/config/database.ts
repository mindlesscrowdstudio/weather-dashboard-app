// backend/src/config/database.ts
// Database connection configuration using the pg library

import { Pool } from 'pg';

// connection pool for better performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://mel:tofu@localhost:5432/weatherapp",
  // For development, we can use fewer connections
  max: 10,
  connectionTimeoutMillis: 5000, // Increased timeout
  idleTimeoutMillis: 30000,
  allowExitOnIdle: false, // Keep pool alive
});

// Test the connection on startup
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database")
});

pool.on("error", (err) => {
  console.error("Unexpected error on client", err);
});

export default pool;
