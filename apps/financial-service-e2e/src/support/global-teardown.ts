import * as fs from 'fs';
import { ensureFile } from 'fs-extra';

module.exports = async function () {
  const archivePath =
    './apps/financial-service-e2e/logs/financial-service-logs.tar';
  await ensureFile(archivePath);
  const outputFileStream = fs.createWriteStream(archivePath);

  const homeNodeAppArquive: NodeJS.ReadableStream =
    await globalThis.containerCode.copyArchiveFromContainer(
      '/home/node/app/logs',
    );
  homeNodeAppArquive.pipe(outputFileStream);

  await Promise.allSettled([
    globalThis.authDatabaseContainer.stop(),
    globalThis.financialDatabaseContainer.stop(),
    globalThis.cacheContainer.stop(),
    globalThis.authCodeContainer.stop(),
    globalThis.financialCodeContainer.stop(),
  ]);
};
