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
    'repl.ts',
    '(module|dto|serializer|body|result|mock|output|payload).ts$',
  ],
  coverageReporters: ['clover', 'html'],
  coverageThreshold: {
    global: {
      lines: 60,
    },
  },
};
