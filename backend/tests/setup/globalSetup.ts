// backend/tests/setup/globalSetup.ts
// This script runs ONCE before all test suites.

import { resetTestDatabase } from './testDb';

export default async () => {
  console.log("🚀 JEST GLOBAL SETUP: Initializing test database...");
  await resetTestDatabase();
  console.log("✅ JEST GLOBAL SETUP: Database is ready.");
};
