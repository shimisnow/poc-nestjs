const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/../../shared/src/$1',
  },
};
