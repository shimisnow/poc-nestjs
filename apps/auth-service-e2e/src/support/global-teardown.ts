/* eslint-disable */

module.exports = async function () {
  globalThis.containerDatabase.stop();
  globalThis.containerCache.stop();
  globalThis.containerCode.stop();
};
