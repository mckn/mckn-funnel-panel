// force timezone to UTC to allow tests to work regardless of local timezone
// generally used by snapshots, but can affect specific tests
process.env.TZ = 'UTC';

const { grafanaESModules, nodeModulesToTransform } = require('./.config/jest/utils');

module.exports = {
  // Jest configuration provided by Grafana scaffolding
  ...require('./.config/jest.config'),
  // nanoid is ESM only and is used by the tooltip components
  transformIgnorePatterns: [nodeModulesToTransform([...grafanaESModules, 'nanoid'])],
};
