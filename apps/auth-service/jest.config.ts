/* eslint-disable */
export default {
  displayName: 'auth-service',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/auth-service',
  collectCoverageFrom: ['<rootDir>/src/**'],
  coveragePathIgnorePatterns: [
    'main.ts',
    '.*\.module\.ts$'
  ],
  coverageReporters: ['clover', 'html'],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
