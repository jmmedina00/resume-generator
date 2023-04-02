import { LanguageCode } from 'iso-639-1';

export type Entry = [key: string, value: any];

export type LocaleMap = {
  [key in LanguageCode]?: object;
};

export interface LocalisedObject {
  flattened: any;
  locales: LocaleMap;
}

export interface LocalisedEntry {
  flattened: Entry;
  locales: LocaleMap;
}

export type EntryLocaliser = (entry: Entry) => LocalisedEntry;
