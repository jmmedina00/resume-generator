import { readFile, writeFile } from 'fs/promises';
import { Options, format, resolveConfig } from 'prettier';
import { parseDocument } from 'yaml';

const main = async () => {
  const file = await readFile('./test.yml', 'utf-8');
  const testYaml = parseDocument(file);

  const node = testYaml.toJS()['foo'] as object;
  const combined = { ...node, shi: 'yang', bar: 'baz' };

  const config = (await resolveConfig('.prettierrc')) as Options;

  await writeFile('./test.json', format(JSON.stringify(combined), config));
};

main();
