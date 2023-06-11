import { render } from 'mustache';
import { parseMarkdown } from './transform';
import { marked } from 'marked';

jest.mock('marked', () => ({
  marked: { parse: jest.fn().mockReturnValue('HTML'), use: jest.fn() },
}));
jest.mock('mustache');
jest.mock('fs/promises');

describe('Markdown transforming', () => {
  const template = 'This is a template';
  const md = 'Markdown contents';

  it('should parse context contents into HTML and provide filled template', async () => {
    (render as jest.Mock).mockReturnValue('This is rendered');

    const rendered = await parseMarkdown(template, md);
    expect(rendered).toEqual('This is rendered');

    expect(marked.parse).toHaveBeenCalledWith('Markdown contents');
    expect(render).toHaveBeenCalledWith('This is a template', {
      contents: 'HTML',
    });
  });

  it('should use a list item cleaner', async () => {
    const rendered = await parseMarkdown(template, md);
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
