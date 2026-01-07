/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  

  testTimeout: 15000,


  moduleNameMapper: {
    '^uuid$': '<rootDir>/tests/mocks/uuid.js',

    '^@/(.*)$': '<rootDir>/src/$1', 
  },
};