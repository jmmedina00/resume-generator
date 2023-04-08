import { LocalisedObject } from './locale.types';

export const extractKey = (
  { flattened, locales: verboseyLocales }: LocalisedObject,
  desiredKey: string
): LocalisedObject => {
  const keychain = desiredKey.split('.');

  const extractor = (object: any) =>
    keychain.reduce((currentLevel, key) => currentLevel[key], object);

  const locales = Object.fromEntries(
    Object.entries(verboseyLocales).map(([key, value]) => [
      key,
      extractor(value),
    ])
  );

  return {
    flattened: extractor(flattened),
    locales,
  };
};
