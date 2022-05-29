/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  roots: ['<rootDir>/src'],

  // collectCoverage: true,

  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  testEnvironment: 'node',
  transform: {
    '.+\\.ts$': 'ts-jest',
  },
  setupFiles: ["<rootDir>/.jest/setEnvVars.js"]
};
