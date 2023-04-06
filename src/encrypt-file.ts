import { readFile, writeFile } from 'fs/promises';
import dotenv from 'dotenv';
import { encryptText } from './encrypt';
import { convertToPrettyJSON } from './prettier';
import { PRIVATE_FILE } from './var';

const encrypt = async () => {
  dotenv.config();

  const contents = await readFile(PRIVATE_FILE, 'utf-8');
  const encrypted = encryptText(contents);

  await writeFile(
    PRIVATE_FILE + '.redacted',
    await convertToPrettyJSON(encrypted)
  );
};

encrypt();
