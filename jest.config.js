/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/out/?(*.)+(spec|test).[jt]s?(x)'],
  passWithNoTests: true,
};