/**
 * Centralized location to define how Jest should run tests, handle file transformations, manage test environments, and report results.
 */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The test environment that will be used for testing
  // 'node' is required for backend tests
  testEnvironment: 'node',
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
};
