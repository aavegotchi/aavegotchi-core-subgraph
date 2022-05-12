// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: true,
  testPathIgnorePatterns: ["node_modules", "tests"],
  testTimeout: 10000000,
};

module.exports = config;
