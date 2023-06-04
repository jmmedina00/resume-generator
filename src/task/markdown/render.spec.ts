import { readFile } from 'fs/promises';
import { RenderContext } from '../context';
import { render } from 'mustache';
import { parseMarkdownIntoDocument } from './render';
import { marked } from 'marked';

jest.mock('marked', () => ({
  marked: { parse: jest.fn().mockReturnValue('rendered'), use: jest.fn() },
}));
jest.mock('mustache');
jest.mock('fs/promises');

describe('Markdown rendering', () => {
  it('should parse context contents into HTML and provide filled template', async () => {
    const context: RenderContext = {
      path: './test/file.md',
      contents: Buffer.from('Markdown contents'),
      prettierOptions: {},
      preprocessFn: jest.fn(),
    };

    const expectedFinalContext: RenderContext = {
      path: './test/file.md',
      contents: Buffer.from('This is rendered'),
      prettierOptions: {},
      preprocessFn: expect.anything(),
    };

    (readFile as jest.Mock).mockResolvedValue('Template from file');
    (render as jest.Mock).mockReturnValue('This is rendered');

    await parseMarkdownIntoDocument(context);
    expect(context).toEqual(expectedFinalContext);

    expect(marked.parse).toHaveBeenCalledWith('Markdown contents');
    expect(readFile).toHaveBeenCalledWith('./assets/markdown.html', 'utf-8');
    expect(render).toHaveBeenCalledWith('Template from file', {
      contents: 'rendered',
    });
  });

  it('should use a list item cleaner', async () => {
    const context: RenderContext = {
      path: './test/file.md',
      contents: Buffer.from('Markdown contents'),
      prettierOptions: {},
      preprocessFn: jest.fn(),
    };

    await parseMarkdownIntoDocument(context);
    expect(marked.use).toHaveBeenCalledWith(
      {
        renderer: { listitem: expect.anything() },
      },
      { mangle: false, headerIds: false } // Used to solve deprecated warnings (and remove some garbage)
    );

    const itemCleaner = (marked.use as jest.Mock).mock.calls[0][0]['renderer'][
      'listitem'
    ] as (s: string) => string;

    const dirty = "<p>I don't want to be a paragraph</p>";
    const expected = "<li>I don't want to be a paragraph</li>";
    expect(itemCleaner(dirty)).toEqual(expected);
  });
});
