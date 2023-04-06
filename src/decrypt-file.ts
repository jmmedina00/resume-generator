import dotenv from 'dotenv';
import { readFile, writeFile } from 'fs/promises';
import { EncryptedData, decryptText } from './encrypt';
import { PRIVATE_FILE } from './var';

const decrypt = async () => {
  dotenv.config();

  const contents = await readFile(PRIVATE_FILE + '.redacted', 'utf-8');
  const encrypted: EncryptedData = JSON.parse(contents);

  await writeFile(PRIVATE_FILE + '.tmp', await decryptText(encrypted));
};

decrypt();
