import { readFile, writeFile } from 'fs/promises';
import dotenv from 'dotenv';
import { encryptText } from './util/encrypt';
import { convertToPrettyJSON } from './util/prettier';
import { PRIVATE_FILE } from './util/var';
import { updateFile } from './service/gdrive';

const encrypt = async () => {
  dotenv.config();

  const fileId = process.env['PRIVATE_FILE_ID'] || '';

  const contents = await readFile(PRIVATE_FILE, 'utf-8');
  const encrypted = encryptText(contents);

  await writeFile(
    PRIVATE_FILE + '.redacted',
    await convertToPrettyJSON(encrypted)
  );

  updateFile(fileId, PRIVATE_FILE + '.redacted');
};

encrypt();
