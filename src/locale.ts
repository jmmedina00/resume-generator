import locale, { LanguageCode } from 'iso-639-1';

const codes = locale.getAllCodes() as string[];

type LocaleMap = {
  [key in LanguageCode]?: object;
};

export interface LocalisedObject {
  flattened: object;
  locales: LocaleMap;
}

const isLocalisedString = (object: any): boolean => {
  return Object.keys(object).every((value) => codes.includes(value));
};

export const getFlattenedObjectAndLocales = (object: any): LocalisedObject => {
  const entries = Object.entries(object);
  let locales: any = {};
  let extractedEntries = [];

  for (const [key, value] of entries) {
    if (['string', 'number'].includes(typeof value)) {
      extractedEntries.push([key, value]);
      continue;
    }

    if (isLocalisedString(value)) {
      extractedEntries.push([key, key]);

      for (const [locale, message] of Object.entries(value as object)) {
        if (!locales[locale]) {
          locales[locale] = {};
        }

        locales[locale][key] = message;
      }
      continue;
    }

    const { flattened: extracted, locales: extractedLocales } =
      getFlattenedObjectAndLocales(value);

    extractedEntries.push([key, extracted]);

    for (const [locale, values] of Object.entries(extractedLocales as object)) {
      if (!locales[locale]) {
        locales[locale] = {};
      }

      locales[locale][key] = values;
    }
  }

  return { flattened: Object.fromEntries(extractedEntries), locales };
};
