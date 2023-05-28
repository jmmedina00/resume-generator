import { render } from 'mustache';

export interface LanguageLink {
  code: string;
  label: string;
  selected: boolean;
}

interface FormatLink {
  href: string;
  label: string;
  icon: string;
}

const formats: FormatLink[] = [
  {
    href: 'resume.pdf',
    label: 'PDF',
    icon: 'download',
  },
  {
    href: 'resume.md.html',
    label: 'Web Markdown',
    icon: 'markdown-fill',
  },
  {
    href: 'resume.md',
    label: 'Markdown',
    icon: 'markdown',
  },
  {
    href: 'resume.json',
    label: 'JSON',
    icon: 'braces',
  },
];

export const generateFromTemplate = (template: string, items: LanguageLink[]) =>
  render(template, { items, formats });
