import { Entry, regenerateFromEntries } from './common';

export const patchObject = (
  flatObject: Object,
  translations: { [key: string]: any }
): object => {
  const entries: Entry[] = Object.entries(flatObject).map(([key, value]) => [
    key,
    value instanceof Object
      ? patchObject(value, translations[key])
      : translations[key] ?? value,
  ]);

  return regenerateFromEntries(entries, Object.getPrototypeOf(flatObject));
};
