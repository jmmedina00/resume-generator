import { readFile, writeFile } from 'fs/promises';
import { parse } from 'yaml';
import { getFlattenedObjectAndLocales } from './mapping/locale';
import dotenv from 'dotenv';
import { Renderable, generateFromTemplate } from './render/navbar';
import { addAtBodyTop } from './render';
import { prettify } from './prettier';

const main = async () => {
  dotenv.config();

  const file = await readFile('./test.yml', 'utf-8');
  const testYaml = parse(file);

  const { flattened, locales } = getFlattenedObjectAndLocales(testYaml);

  console.log(flattened);
  console.log(locales);

  const items: Renderable[] = [
    { code: 'en', label: 'English', selected: true },
    { code: 'es', label: 'Español', selected: false },
  ];

  const template = await readFile('./assets/navbar.html', 'utf-8');
  const rendered = await readFile('./resume.html', 'utf-8');

  const filledTemplate = generateFromTemplate(template, items);
  const finished = addAtBodyTop(rendered, filledTemplate);

  await writeFile(
    './finish.html',
    await prettify(finished, { parser: 'html' })
  );
};

main();
