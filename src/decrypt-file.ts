import dotenv from 'dotenv';
import { writeFile } from 'fs/promises';
import { EncryptedData, decryptText } from './util/encrypt';
import { PRIVATE_FILE } from './util/var';
import { getFileContents } from './service/gdrive';

const decrypt = async () => {
  dotenv.config();

  const fileId = process.env['PRIVATE_FILE_ID'] || '';
  const encrypted: EncryptedData = await getFileContents(fileId);

  await writeFile(PRIVATE_FILE + '.tmp', await decryptText(encrypted));
};

decrypt();
