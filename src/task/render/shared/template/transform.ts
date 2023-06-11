import { render } from 'mustache';

export interface HelperFunctions {
  [key: string]: () => (
    text: string,
    render: (text: string) => string
  ) => string;
}

export const applyMustacheTemplateToResource =
  (funcs: HelperFunctions) => async (template: string, json: string) => {
    const object = JSON.parse(json);
    return render(template, { ...object, ...funcs });
  };
