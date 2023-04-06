import { readFile, writeFile } from 'fs/promises';
import { parse } from 'yaml';
import { getFlattenedObjectAndLocales } from './mapping/locale';
import dotenv from 'dotenv';
import { convertToPrettyJSON } from './prettier';

const main = async () => {
  dotenv.config();

  const file = await readFile('./test.yml', 'utf-8');
  const testYaml = parse(file);

  const { flattened, locales } = getFlattenedObjectAndLocales(testYaml);

  console.log(flattened);
  console.log(locales);

  await writeFile('./test.json', await convertToPrettyJSON(testYaml));
};

main();
