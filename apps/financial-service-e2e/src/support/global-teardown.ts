module.exports = async function () {
  await Promise.allSettled([
    globalThis.authDatabaseContainer.stop(),
    globalThis.financialDatabaseContainer.stop(),
    globalThis.cacheContainer.stop(),
    globalThis.authCodeContainer.stop(),
    globalThis.financialCodeContainer.stop(),
  ]);
};
