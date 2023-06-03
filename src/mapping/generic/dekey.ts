import { LocalisedObject } from '../locale.types';

const applyToEntries = (
  object: any,
  func: (...a: Parameters<Parameters<[string, any][]['map']>[0]>) => [any, any]
) =>
  Object.fromEntries(
    (Object.entries(object) as [string, any]).map<[string, any]>(func)
  );

export const dekeyObject = (
  { flattened: keyedFlattened, locales: keyedLocales }: LocalisedObject,
  defaultedFields: string[]
): LocalisedObject => {
  if (!!defaultedFields.find((field) => field.includes('.')))
    throw new Error('Unable to default nested properties');

  const locales = applyToEntries(keyedLocales, ([key, value]) => [
    key,
    applyToEntries(value, ([_, contents], index) => [index, contents]),
  ]);

  const flattened = Object.entries(keyedFlattened as object).map(
    ([key, value]) =>
      applyToEntries(value, ([field, string]) => {
        const modified = defaultedFields.includes(field) ? key : string;

        if (typeof string === 'object' && modified === key)
          throw new Error('Only strings may be defaulted');
        return [field, modified];
      })
  );
  return { flattened, locales };
};
