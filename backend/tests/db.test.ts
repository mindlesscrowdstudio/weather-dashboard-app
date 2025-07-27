// backend/tests/db.test.ts
// Tests for database setup and basic operations.
import { createTestUser, cleanupTestData } from "./setup/testDb"
import pool from "../src/config/database"

async function addFavoriteCity(userId: number, cityName: string, countryCode: string) {
  const result = await pool.query(
    "INSERT INTO favorite_cities (user_id, city_name, country_code) VALUES ($1, $2, $3) RETURNING *",
    [userId, cityName, countryCode],
  );
  return result.rows[0];
}

describe("Database Operations", () => {
  // single beforeEach runs before EVERY test in this entire file.
  // clean slate for every single test case.
  beforeEach(async () => {
    await cleanupTestData();
  });

  test("should create a user and retrieve them from the database", async () => {
    const username = "db-test-user"
    const userId = await createTestUser(username);

    expect(typeof userId).toBe("number");

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId])
    expect(result.rowCount).toBe(1);
    expect(result.rows[0].username).toBe(username);
  });

  describe("When managing favorite cities", () => {
    let testUserId: number;

    // This hook now only needs to create the user for this specific suite of tests.
    beforeEach(async () => {
      testUserId = await createTestUser("favorite-user");
    });

    test("should allow a user to add a favorite city", async () => {
      const cityName = "London";
      const countryCode = "GB";

      const favorite = await addFavoriteCity(testUserId, cityName, countryCode);

      expect(favorite).toBeDefined();
      expect(favorite.user_id).toBe(testUserId);
      expect(favorite.city_name).toBe(cityName);
      expect(favorite.country_code).toBe(countryCode);
    });

    test("should prevent adding the same favorite city twice", async () => {
      const cityName = "Paris";
      const countryCode = "FR";

      await addFavoriteCity(testUserId, cityName, countryCode);

      await expect(addFavoriteCity(testUserId, cityName, countryCode)).rejects.toThrow(
        "duplicate key value violates unique constraint",
      );
    });
  });
});
