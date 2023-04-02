import { getFlattenedObjectAndLocales } from './locale';

describe('Object locale', () => {
  it('should return object as-is when no locales are present', () => {
    const subject = { a: 1, b: 'Thirty', c: 'Test' };
    const { flattened, locales } = getFlattenedObjectAndLocales(subject);

    expect(flattened).toEqual(subject);
    expect(locales).toEqual({});
  });

  it('should return object with fields flattened and locales separated', () => {
    const subject = {
      notTranslated: 'Hello',
      translated: {
        es: 'Hola',
        en: 'Hi',
        fr: 'Bonjour',
      },
      train: 'Trenecito',
      another: {
        ja: 'ひらがな',
        fr: 'lettres',
      },
    };

    const expectedFlattened = {
      notTranslated: 'Hello',
      translated: 'translated',
      train: 'Trenecito',
      another: 'another',
    };

    const expectedLocales = {
      es: {
        translated: 'Hola',
      },
      en: {
        translated: 'Hi',
      },
      fr: { translated: 'Bonjour', another: 'lettres' },
      ja: { another: 'ひらがな' },
    };

    const { flattened, locales } = getFlattenedObjectAndLocales(subject);

    expect(flattened).toEqual(expectedFlattened);
    expect(locales).toEqual(expectedLocales);
  });

  it('should be able to flatten nested localised fields and represent locales appropriately', () => {
    const subject = {
      notTranslated: 'Hello',
      nest: {
        subject: {
          ja: 'ひらがな',
          fr: 'lettres',
        },
        test: 'Testing',
        oneMore: {
          es: 'Máaaaas',
        },
        nested: {
          test: 'Zero',
          localised: {
            en: 'Silly',
          },
        },
      },
      train: 'Trenecito',
    };

    const expectedFlattened = {
      notTranslated: 'Hello',
      nest: {
        subject: 'subject',
        test: 'Testing',
        oneMore: 'oneMore',
        nested: {
          test: 'Zero',
          localised: 'localised',
        },
      },
      train: 'Trenecito',
    };

    const expectedLocales = {
      ja: { nest: { subject: 'ひらがな' } },
      fr: { nest: { subject: 'lettres' } },
      es: { nest: { oneMore: 'Máaaaas' } },
      en: { nest: { nested: { localised: 'Silly' } } },
    };

    const { flattened, locales } = getFlattenedObjectAndLocales(subject);

    expect(flattened).toEqual(expectedFlattened);
    expect(locales).toEqual(expectedLocales);
  });

  it('should return keep arrays as arrays in flattened but all objects in locale', () => {
    const subject = {
      test: 'Testing',
      keywords: [
        'one',
        'two',
        {
          en: 'three',
          es: 'tres',
        },
        'cuatro',
        {
          en: 'five',
          es: 'cinco',
        },
      ],
    };

    const expectedFlattened = {
      test: 'Testing',
      keywords: ['one', 'two', '2', 'cuatro', '4'],
    };

    const expectedLocales = {
      es: { keywords: { 2: 'tres', 4: 'cinco' } },
      en: { keywords: { 2: 'three', 4: 'five' } },
    };

    const { flattened, locales } = getFlattenedObjectAndLocales(subject);

    expect(flattened).toEqual(expectedFlattened);
    expect(locales).toEqual(expectedLocales);
  });
});
