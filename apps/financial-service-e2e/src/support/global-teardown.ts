/* eslint-disable */
module.exports = async function () {
  await Promise.all([
    globalThis.containerDatabase.stop(),
    globalThis.containerCache.stop(),
    globalThis.containerCode.stop(),
  ]);
};
