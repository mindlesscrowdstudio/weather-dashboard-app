// backend/tests/db.test.ts
// Tests for database setup and basic operations.
import { setupTestDatabase, teardownTestDatabase, createTestUser } from './setup/testDb';
import pool from '../src/config/database';


// In a real app, this would live in a service/model file, e.g., `src/services/cityService.ts`
async function addFavoriteCity(userId: number, cityName: string, countryCode: string) {
  const result = await pool.query(
    'INSERT INTO favorite_cities (user_id, city_name, country_code) VALUES ($1, $2, $3) RETURNING *',
    [userId, cityName, countryCode]
  );
  return result.rows[0];
}


// 'describe' creates a test suite for our database operations.
describe('Database Operations', () => {
//these funcs prepares the db before the tests run and clean it up after they done 
  // `beforeAll` runs once before any tests in this file start.
  // setting up the database.
  beforeAll(async () => {
    await setupTestDatabase();
  });

  // `afterAll` runs once after all tests in this file are complete.
  // For cleaning up and closing connections.
  afterAll(async () => {
    await teardownTestDatabase();
  });

  // Test case 1: Verify existing functionality
  test('should create a user and retrieve them from the database', async () => {
    const username = 'testuser1';
    const userId = await createTestUser(username);

    // Verify that we got a valid ID back
    expect(typeof userId).toBe('number');

    // Verify the user actually exists in the database
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    expect(result.rowCount).toBe(1);
    expect(result.rows[0].username).toBe(username);
  });

  // Test case 2: A full RED -> GREEN
  describe('When managing favorite cities', () => {
    let testUserId: number;

    // Create a single user for all tests within this 'describe' block
    beforeAll(async () => {
      testUserId = await createTestUser('favorite-user');
    });

    // RED: Write the test for a feature that doesn't exist yet.
    // This test asserts that we can add a favorite city for our user.
    test('should allow a user to add a favorite city', async () => {
      const cityName = 'London';
      const countryCode = 'GB';

      // This call would fail until we write the `addFavoriteCity` function
      const favorite = await addFavoriteCity(testUserId, cityName, countryCode);

      // Assertions to verify the outcome
      expect(favorite).toBeDefined();
      expect(favorite.user_id).toBe(testUserId);
      expect(favorite.city_name).toBe(cityName);
      expect(favorite.country_code).toBe(countryCode);
    });

    // This is another test: checking for expected failures (constraints).
    test('should prevent adding the same favorite city twice', async () => {
      const cityName = 'Paris';
      const countryCode = 'FR';

      // Add it the first time - this should succeed
      await addFavoriteCity(testUserId, cityName, countryCode);

      // Add it the second time - this should fail due to the UNIQUE constraint.
      // We use `expect().rejects.toThrow()` to assert that a promise fails as expected.
      await expect(
        addFavoriteCity(testUserId, cityName, countryCode)
      ).rejects.toThrow('duplicate key value violates unique constraint');
    });
  });
});
