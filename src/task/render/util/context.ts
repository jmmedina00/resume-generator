import type { RenderContext } from '../../context';
import type { Processor } from '../../io/read';

export const setIntoContext =
  (key: string): Processor<RenderContext, string> =>
  (data, context) => {
    context.resources[key] = data;
  };

export const appendToObjectResource =
  (key: string, addendum: any) => (context: RenderContext) => {
    const baseObject = JSON.parse(context.resources[key]);
    const appendedObject = { ...baseObject, ...addendum };
    context.resources[key] = JSON.stringify(appendedObject);
  };
