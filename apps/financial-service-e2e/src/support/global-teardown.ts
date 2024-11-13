/* eslint-disable */
module.exports = async function () {
  await Promise.allSettled([
    globalThis.authDatabaseContainer.stop(),
    globalThis.financialDatabaseContainer.stop(),
    globalThis.authCodeContainer.stop(),
  ]);
};
