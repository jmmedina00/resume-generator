import { readFile } from 'fs/promises';
import { marked } from 'marked';
import { RenderContext } from '../context';
import { render } from 'mustache';

export const parseMarkdownIntoDocument = async (
  ctx: RenderContext
): Promise<void> => {
  const md = ctx.contents.toString('utf-8');
  const html = marked.parse(md);

  const template = await readFile('./assets/markdown.html', 'utf-8');
  const rendered = render(template, { contents: html });

  ctx.contents = Buffer.from(rendered);
};
