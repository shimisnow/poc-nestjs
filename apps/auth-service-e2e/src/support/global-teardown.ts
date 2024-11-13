/* eslint-disable */
import * as fs from 'fs';
import { ensureFile } from 'fs-extra';

module.exports = async function () {
  /***** Auth Log *****/
  const authArchivePath = './apps/auth-service-e2e/logs/auth-service-logs.tar';
  await ensureFile(authArchivePath);
  const authOutputFileStream = fs.createWriteStream(authArchivePath);

  const authHomeNodeAppArquive: NodeJS.ReadableStream =
    await globalThis.authCodeContainer.copyArchiveFromContainer(
      '/home/node/app/logs',
    );
  authHomeNodeAppArquive.pipe(authOutputFileStream);

  await Promise.allSettled([
    globalThis.authDatabaseContainer.stop(),
    globalThis.financialDatabaseContainer.stop(),
    globalThis.authCodeContainer.stop(),
  ]);
};
