import * as fs from 'fs';
import { ensureFile } from 'fs-extra';

module.exports = async function () {
  const archivePath = './apps/auth-service-e2e/logs/auth-service-logs.tar';
  await ensureFile(archivePath);
  const outputFileStream = fs.createWriteStream(archivePath);

  const homeNodeAppArquive: NodeJS.ReadableStream = await globalThis.containerCode.copyArchiveFromContainer('/home/node/app/logs');
  homeNodeAppArquive.pipe(outputFileStream);

  await Promise.all([
    globalThis.containerDatabase.stop(),
    globalThis.containerCache.stop(),
    globalThis.containerCode.stop(),
  ]);
};
