/* eslint-disable */
export default {
  displayName: 'user-service',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/user-service',
  collectCoverageFrom: ['<rootDir>/src/**'],
  coveragePathIgnorePatterns: [
    'main.ts',
    'repl.ts',
    '(module|dto|serializer|entity|repository|body|result|output|payload|model|decorator|mock|index).ts$',
  ],
  coverageReporters: ['clover', 'html'],
  coverageThreshold: {
    global: {
      lines: 85,
    },
  },
};
