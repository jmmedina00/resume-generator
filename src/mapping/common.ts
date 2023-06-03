export type Entry = [key: string, value: any];

export const regenerateFromEntries = (entries: Entry[], prototype: any) =>
  prototype === Object.getPrototypeOf([[]])
    ? entries.map(([_, value]) => value)
    : Object.fromEntries(entries);

export const isPlainType = (value: any) =>
  ['string', 'number', 'boolean'].includes(typeof value);
