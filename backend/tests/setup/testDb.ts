// backend/tests/setup/testDb.ts
// Test database setup and teardown utilities

import { runMigrations, clearDatabase } from '../../src/migrations/migrate';
import pool from '../../src/config/database';

export async function setupTestDatabase() {
  await clearDatabase()
  await runMigrations()
}

export async function teardownTestDatabase() {
  await clearDatabase()
  await pool.end()
}

// Helper function to create a test user for our tests
export async function createTestUser(username = "testuser"): Promise<number> {
  const result = await pool.query("INSERT INTO users (username) VALUES ($1) RETURNING id", [username])
  return result.rows[0].id
}
