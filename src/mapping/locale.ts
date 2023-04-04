import locale, { LanguageCode } from 'iso-639-1';
import { EntryLocaliser, LocaleMap, LocalisedObject } from './locale.types';
import { Entry, regenerateFromEntries } from '../common';

const codes = locale.getAllCodes() as string[];

const crushLocaleMapsTogether = (finalMap: LocaleMap, map: LocaleMap) => {
  const finalKeys = Object.keys(finalMap) as LanguageCode[];
  const currentKeys = Object.keys(map) as LanguageCode[];
  const uniqueKeys = new Set([...finalKeys, ...currentKeys]);

  const mergedEntries = [...uniqueKeys].map((locale) => [
    locale,
    { ...finalMap[locale], ...map[locale] },
  ]);

  return Object.fromEntries(mergedEntries);
};

const getProperLocaliser = (value: any) => {
  if (['string', 'number'].includes(typeof value)) {
    return getEntryAsIs;
  }

  if (Object.keys(value).every((key) => codes.includes(key))) {
    return getEntryWithLocalesStripped;
  }

  return getLocalisedObject;
};

const getEntryAsIs: EntryLocaliser = (entry) => ({
  flattened: entry,
  locales: {},
});

const getEntryWithLocalesStripped: EntryLocaliser = ([key, value]) => {
  const flattened: Entry = [key, key];

  const localeEntries = Object.entries(value).map(([locale, message]) => [
    locale,
    { [key]: message },
  ]);

  return { flattened, locales: Object.fromEntries(localeEntries) as LocaleMap };
};

const getLocalisedObject: EntryLocaliser = ([key, object]) => {
  const localisedEntries = Object.entries(object).map((entry) => {
    const [_, value] = entry;
    return getProperLocaliser(value)(entry);
  });

  const flattenedEntries = localisedEntries.map(({ flattened }) => flattened);
  const localisedObject = regenerateFromEntries(
    flattenedEntries,
    Object.getPrototypeOf(object)
  );

  const localeList = localisedEntries.map(({ locales }) => locales);
  const crushedLocales = localeList.reduce(crushLocaleMapsTogether, {});

  const locales = !key
    ? crushedLocales
    : Object.fromEntries(
        Object.entries(crushedLocales).map(([locale, value]) => [
          locale,
          { [key]: value },
        ])
      );

  return { flattened: [key, localisedObject], locales };
};

export const getFlattenedObjectAndLocales = (object: any): LocalisedObject => {
  const {
    flattened: [_, flattened],
    locales,
  } = getLocalisedObject(['', object]);

  return { flattened, locales };
};
