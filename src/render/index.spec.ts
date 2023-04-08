import { readFile } from 'fs/promises';
import { addAtBodyTop } from '.';
import { prettify } from '../prettier';

describe('HTML rendering', () => {
  it('should add snip to the very begin of document body', async () => {
    const html = await readFile('./test/html/before-snip.html', 'utf-8');
    const snip = `<ul><li>Alpha</li><li>Beta</li><li>Charlie</li></ul>`;

    const expected = await readFile('./test/html/after-snip.html', 'utf-8');
    const actual = addAtBodyTop(html, snip);

    expect(await prettify(actual, { parser: 'html' })).toEqual(expected);
  });
});
