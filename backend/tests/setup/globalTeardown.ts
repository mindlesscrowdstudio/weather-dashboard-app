// backend/tests/setup/globalTeardown.ts
// This script runs ONCE after all test suites have finished.
import pool from "../../src/config/database";

export default async () => {
  console.log("🧹 JEST GLOBAL TEARDOWN: Closing database pool...");
 
  await pool.end(); // Close the connection pool after all tests

  console.log("✅ JEST GLOBAL TEARDOWN: Pool closed.");
};
