/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use ts-jest to transform TypeScript files before running tests
  preset: 'ts-jest',

  // We're running in Node.js environment (not browser)
  testEnvironment: 'node',

  // Where to find test files
  testMatch: ['**/*.test.ts'],

  // Path aliases (matches tsconfig)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Show coverage report after tests
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',      // Entry point - skip coverage
    '!src/**/*.d.ts',     // Type declarations - skip
  ],

  // ts-jest specific settings
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
};
