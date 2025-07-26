// backend/src/migrations/migrate.ts
// Simple migration runner for development and testing

import fs from 'fs';
import path from 'path';
import pool from '../config/database';

export async function runMigrations() {
  try {
    // Read the SQL file
    const migrationPath = path.join(__dirname, '001_create_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await pool.query(migrationSQL)
    console.log("✅ Database migration completed successfully")
   
  } catch(error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

export async function clearDatabase() {
  try {
    // Drop tables in reverse order due to foreign key constraints
    await pool.query("DROP TABLE IF EXISTS weather_cache CASCADE")
    await pool.query("DROP TABLE IF EXISTS weather_history CASCADE")
    await pool.query("DROP TABLE IF EXISTS favorite_cities CASCADE")
    await pool.query("DROP TABLE IF EXISTS users CASCADE")
    console.log("✅ Database cleared successfully")
  } catch (error) {
    console.error("❌ Failed to clear database:", error)
    throw error
  }
}
