import { readFile } from 'fs/promises';
import { addAtBodyBottom, addAtBodyTop, addStyles } from '.';
import { prettify } from '../prettier';

describe('HTML rendering', () => {
  it('should add snip to the very begin of document body', async () => {
    const html = await readFile('./test/html/before-snip.html', 'utf-8');
    const snip = `<ul><li>Alpha</li><li>Beta</li><li>Charlie</li></ul>`;

    const expected = await readFile('./test/html/after-snip.html', 'utf-8');
    const actual = addAtBodyTop(html, snip);

    expect(await prettify(actual, { parser: 'html' })).toEqual(expected);
  });

  it('should add snip to the very end of the document body', async () => {
    const html = await readFile('./test/html/before-snip.html', 'utf-8');
    const snip = `<ul><li>Alpha</li><li>Beta</li><li>Charlie</li></ul>`;

    const expected = await readFile(
      './test/html/after-snip-bottom.html',
      'utf-8'
    );
    const actual = addAtBodyBottom(html, snip);

    expect(await prettify(actual, { parser: 'html' })).toEqual(expected);
  });

  it('should add CSS to the very end of the document head', async () => {
    const html = await readFile('./test/html/before-snip.html', 'utf-8');
    const css =
      '.active {color: white; font-size: 3em;} body.active div {background-color: #aaa;}';

    const expected = await readFile('./test/html/with-css.html', 'utf-8');
    const actual = addStyles(html, css);
    expect(await prettify(actual, { parser: 'html' })).toEqual(expected);
  });
});
