// backend/tests/setup/testDb.ts
// handle test data lifecycle
import { runMigrations, clearDatabase } from "../../src/migrations/migrate"
import pool from "../../src/config/database";

// This is now the main setup function, called by globalSetup.
export async function resetTestDatabase() {
  try {
    console.log("🔄 Completely resetting test database...")
    await clearDatabase();
    await runMigrations();
    console.log("✅ Database completely reset")
  } catch (error) {
    console.error("❌ Failed to reset database:", error)
    throw error;
  }
}

// Helper function to create OR get existing test user
export async function createTestUser(username = "testuser"): Promise<number> {
  try {
    const result = await pool.query("INSERT INTO users (username) VALUES ($1) RETURNING id", [username])
    return result.rows[0].id
  } catch (error) {
    console.error(`❌ Error creating test user "${username}":`, error)
    throw error
  }
}

// Cleans data from tables between tests to ensure isolation.
export async function cleanupTestData() {
  try {
    await pool.query("DELETE FROM weather_history");
    await pool.query("DELETE FROM favorite_cities");
    await pool.query("DELETE FROM weather_cache");
     await pool.query("DELETE FROM users");
  } catch (error) {
    console.error("❌ Failed to cleanup test data:", error);
    throw error;
  }
}
// Function to check current database state (for debugging)
export async function debugDatabaseState() {
  try {
    const users = await pool.query("SELECT id, username FROM users ORDER BY id")
    const history = await pool.query("SELECT COUNT(*) FROM weather_history")
    const favorites = await pool.query("SELECT COUNT(*) FROM favorite_cities")

    console.log("🔍 Database State:")
    console.log(`  Users: ${users.rows.length} - ${users.rows.map((u) => `${u.id}:${u.username}`).join(", ")}`)
    console.log(`  History: ${history.rows[0].count}`)
    console.log(`  Favorites: ${favorites.rows[0].count}`)
  } catch (error) {
    console.error("❌ Failed to check database state:", error)
  }
}
