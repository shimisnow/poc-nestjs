/* eslint-disable */
export default {
  displayName: 'shared',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/shared',
  collectCoverageFrom: ['<rootDir>/src/**'],
  coveragePathIgnorePatterns: [
    '.*.(module|serializer|enum|entity|decorator|payload|mock|index).ts$',
  ],
  coverageReporters: ['clover', 'html'],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
};
