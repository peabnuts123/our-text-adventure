// Set ENVIRONMENT_ID to test
process.env.ENVIRONMENT_ID = 'test';

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
    '<rootDir>/test/setup/configure-logger.ts',
    '<rootDir>/test/setup/fail-on-no-assertion.ts',
    '<rootDir>/test/setup/mock-fetch.ts',
  ],
  testRegex: [
    "test/.*\\.test.[jt]s?$",
  ],
  moduleNameMapper: {
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
