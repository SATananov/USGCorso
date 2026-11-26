module.exports = {
  preset: 'jest-expo',
  testMatch: [
    '<rootDir>/tests/auth/**/*.test.js',
    '<rootDir>/tests/navigation/**/*.test.js',
    '<rootDir>/tests/materials/**/*.test.js',
    '<rootDir>/tests/mobile/**/*.test.js',
    '<rootDir>/tests/softuni-demo/**/*.test.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '^\\.\\./screens/.*$': '<rootDir>/tests/navigation/mocks/ScreenStub.js',
  },
  clearMocks: true,
};
