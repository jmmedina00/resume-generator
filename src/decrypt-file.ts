import dotenv from 'dotenv';
import { writeFile } from 'fs/promises';
import { EncryptedData, decryptText } from './encrypt';
import { PRIVATE_FILE } from './var';
import { getFileContents } from './upload/gdrive';

const decrypt = async () => {
  dotenv.config();

  const fileId = process.env['PRIVATE_FILE_ID'] || '';
  const encrypted: EncryptedData = await getFileContents(fileId);

  await writeFile(PRIVATE_FILE + '.tmp', await decryptText(encrypted));
};

decrypt();
