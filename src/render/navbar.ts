import { render } from 'mustache';

export interface Renderable {
  code: string;
  label: string;
  selected: boolean;
}

export const generateFromTemplate = (template: string, items: Renderable[]) =>
  render(template, { items });
