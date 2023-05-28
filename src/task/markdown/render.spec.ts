import { readFile } from 'fs/promises';
import { RenderContext } from '../context';
import { render } from 'mustache';
import { parseMarkdownIntoDocument } from './render';
import { marked } from 'marked';

jest.mock('marked', () => ({
  marked: { parse: jest.fn().mockReturnValue('rendered') },
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
});
