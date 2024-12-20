/* eslint-disable */
export default {
  displayName: 'financial-service',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/financial-service',
  collectCoverageFrom: ['<rootDir>/src/**'],
  coveragePathIgnorePatterns: [
    'main.ts',
    'repl.ts',
    '.*.(module|controller|dto|serializer|body|result|mock).ts$',
  ],
  coverageReporters: ['clover', 'html'],
  coverageThreshold: {
    global: {
      lines: 60,
    },
  },
};
