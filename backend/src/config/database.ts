// backend/src/config/database.ts
// Database connection configuration using the pg library

import { Pool } from 'pg';

// connection pool for better performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://mel:tofu@localhost:5432/weatherapp",
  // For development, we can use fewer connections
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection on startup
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database")
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
  process.exit(-1)
});

export default pool;
