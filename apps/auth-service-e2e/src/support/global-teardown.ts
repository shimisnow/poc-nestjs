/* eslint-disable */

module.exports = async function () {
  globalThis.containerDatabase.stop();
  globalThis.containerCode.stop();
};
