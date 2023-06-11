import { marked } from 'marked';
import { render } from 'mustache';

const listitem = (text = '') =>
  `<li>${text.trim().replace(/<p>(.+)<\/p>/, '$1')}</li>`;

export const parseMarkdown = async (template: string, md: string) => {
  marked.use({ renderer: { listitem } }, { mangle: false, headerIds: false });
  const html = marked.parse(md);
  return render(template, { contents: html });
};
