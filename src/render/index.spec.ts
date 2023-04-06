import { addAtBodyTop } from '.';
import { prettify } from '../prettier';

describe('HTML rendering', () => {
  it('should add snip to the very begin of document body', async () => {
    const html = `<html>
        <head>
          <title>Test</title>
        </head>
        <body>
          <p>Beginning of document</p>
          <div>Visit our website</div>
          <script>
            alert('Hello world');
          </script>
        </body>
      </html>
        `;
    const snip = `<ul>
        <li>Alpha</li>
        <li>Beta</li>
        <li>Charlie</li>
    </ul>`;

    const expected = `<html>
    <head>
      <title>Test</title>
    </head>
    <body>
      <ul>
        <li>Alpha</li>
        <li>Beta</li>
        <li>Charlie</li>
      </ul>
      <p>Beginning of document</p>
      <div>Visit our website</div>
      <script>
        alert('Hello world');
      </script>
    </body>
  </html>
  `;

    const actual = addAtBodyTop(html, snip);
    expect(await prettify(actual, { parser: 'html' })).toEqual(
      await prettify(expected, { parser: 'html' })
    );
  });
});
