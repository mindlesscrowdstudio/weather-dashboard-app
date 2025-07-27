// backend/scripts/setup-database.ts
// Script to manually set up the database for development/testing
import { runMigrations } from "../migrations/migrate";
import pool  from "../config/database"; 

async function setupDatabase() {
  try {
    console.log("Setting up database...")

    // Run the migration to create tables
    await runMigrations()

    console.log("✅ Database setup complete!")
    console.log("📋 Tables created:")
    console.log("  - users")
    console.log("  - favorite_cities")
    console.log("  - weather_history")
    console.log("  - weather_cache")
  } catch (error) {
    console.error("❌ Database setup failed:", error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
