// Set ENVIRONMENT_ID to test
// @NOTE must match the table name configured in terraform/modules/db/locals.tf
process.env.ENVIRONMENT_ID = 'test';
process.env.PROJECT_ID = 'our-text-adventure';

// See jest docs for config options: https://jestjs.io/docs/en/configuration
module.exports = {
  preset: "ts-jest",
  globals: {
    'ts-jest': {
      'tsconfig': '<rootDir>/test/tsconfig.json',
    },
  },
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  testURL: "http://localhost:8080",
  setupFilesAfterEnv: [
    '<rootDir>/test/setup/fail-on-no-assertion.ts',
    '<rootDir>/test/setup/mock-fetch.ts',
  ],
  testRegex: [
    "test/.*\\.test.[jt]s$",
  ],
  moduleNameMapper: {
    // DB - @NOTE make sure you don't call any mother modules 'db'...
    "/db$": "<rootDir>/test/mocks/mockDb",
    // === @app
    "^@app/(.*)$": "<rootDir>/src/$1",
    // === @test
    "^@test/(.*)$": "<rootDir>/test/$1",
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,ts}',
  ],
};
