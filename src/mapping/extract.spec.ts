import { extractKey } from './extract';
import { LocalisedObject } from './locale.types';

describe('Localised object key extraction', () => {
  it('should provide object as-is along with locales from existing localised object', () => {
    const locales: LocalisedObject = {
      flattened: {
        foo: {
          bar: 'bar',
          baz: 'Not translated',
          characters: ['0', 'Han Solo', '2'],
        },
        bar: {
          blue: 'blue',
          black: 'Lechonk',
        },
      },
      locales: {
        en: {
          foo: { bar: 'Spanish', characters: { 0: 'Ying', 2: 'Yang' } },
          bar: { blue: "I'm Blue" },
        },
        es: {
          foo: { bar: 'Español', characters: { 0: 'Yang', 2: 'Yin' } },
          bar: { blue: 'Azul' },
        },
        fr: {
          foo: { bar: 'Espagnol', characters: { 0: 'Ting', 2: 'Tang' } },
          bar: { blue: 'Bleu' },
        },
      },
    };

    const expected: LocalisedObject = {
      flattened: {
        bar: 'bar',
        baz: 'Not translated',
        characters: ['0', 'Han Solo', '2'],
      },
      locales: {
        en: { bar: 'Spanish', characters: { 0: 'Ying', 2: 'Yang' } },
        es: { bar: 'Español', characters: { 0: 'Yang', 2: 'Yin' } },
        fr: { bar: 'Espagnol', characters: { 0: 'Ting', 2: 'Tang' } },
      },
    };

    const actual = extractKey(locales, 'foo');
    expect(actual).toEqual(expected);
  });

  it('should provide array as-is along with locales from existing localised object', () => {
    const locales: LocalisedObject = {
      flattened: { words: ['qwerty', '1'], bar: { test: 'This is a test' } },
      locales: {
        en: { words: { 1: 'Here' } },
        es: { words: { 1: 'Aquí' } },
      },
    };

    const expected: LocalisedObject = {
      flattened: ['qwerty', '1'],
      locales: {
        en: { 1: 'Here' },
        es: { 1: 'Aquí' },
      },
    };

    const actual = extractKey(locales, 'words');
    expect(actual).toEqual(expected);
  });

  it('should be able to extract nested object and locales', () => {
    const locales: LocalisedObject = {
      flattened: {
        foo: {
          bar: { ying: 'ying', yang: 'yang', san: 'Untranslated' },
          sign: 'Signature',
        },
        test: { start: 'Anytime' },
      },
      locales: {
        en: { foo: { bar: { ying: 'qwerty', yang: 'asdfg' } } },
        es: { foo: { bar: { ying: 'dvorak', yang: 'aoeui' } } },
      },
    };

    const expected: LocalisedObject = {
      flattened: { ying: 'ying', yang: 'yang', san: 'Untranslated' },
      locales: {
        en: { ying: 'qwerty', yang: 'asdfg' },
        es: { ying: 'dvorak', yang: 'aoeui' },
      },
    };

    const actual = extractKey(locales, 'foo.bar');
    expect(actual).toEqual(expected);
  });

  it('should be able to extract nested array and locales', () => {
    const locales: LocalisedObject = {
      flattened: {
        foo: {
          bar: 'bar',
          baz: 'Not translated',
          characters: ['0', 'Han Solo', '2'],
        },
        bar: {
          blue: 'blue',
          black: 'Lechonk',
        },
      },
      locales: {
        en: {
          foo: { bar: 'Spanish', characters: { 0: 'Ying', 2: 'Yang' } },
          bar: { blue: "I'm Blue" },
        },
        es: {
          foo: { bar: 'Español', characters: { 0: 'Yang', 2: 'Yin' } },
          bar: { blue: 'Azul' },
        },
        fr: {
          foo: { bar: 'Espagnol', characters: { 0: 'Ting', 2: 'Tang' } },
          bar: { blue: 'Bleu' },
        },
      },
    };

    const expected: LocalisedObject = {
      flattened: ['0', 'Han Solo', '2'],
      locales: {
        en: { 0: 'Ying', 2: 'Yang' },
        es: { 0: 'Yang', 2: 'Yin' },
        fr: { 0: 'Ting', 2: 'Tang' },
      },
    };

    const actual = extractKey(locales, 'foo.characters');
    expect(actual).toEqual(expected);
  });
});
