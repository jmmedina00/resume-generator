import { readFile, writeFile } from 'fs/promises';
import { Options, format, resolveConfig } from 'prettier';
import { parse } from 'yaml';
import { getFlattenedObjectAndLocales } from './mapping/locale';

const main = async () => {
  const file = await readFile('./test.yml', 'utf-8');
  const testYaml = parse(file);

  const { flattened, locales } = getFlattenedObjectAndLocales(testYaml);

  console.log(flattened);
  console.log(locales);

  const config = (await resolveConfig('.prettierrc')) as Options;

  await writeFile('./test.json', format(JSON.stringify(testYaml), config));
};

main();
