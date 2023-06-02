import { getFlattenedObjectAndLocales } from './locale';

describe('Object locale', () => {
  it('should return object as-is when no locales are present', () => {
    const subject = {
      a: 1,
      b: 'Thirty',
      c: 'Test',
      condition: true,
      secret: false,
    };
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
      generic: false,
      check: {
        en: true,
        es: false,
      },
      another: {
        ja: 'ひらがな',
        fr: 'lettres',
      },
    };

    const expectedFlattened = {
      notTranslated: 'Hello',
      generic: false,
      check: 'check',
      translated: 'translated',
      train: 'Trenecito',
      another: 'another',
    };

    const expectedLocales = {
      es: {
        translated: 'Hola',
        check: false,
      },
      en: {
        translated: 'Hi',
        check: true,
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
            es: true,
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
      es: { nest: { oneMore: 'Máaaaas', nested: { localised: true } } },
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
        false,
        { en: true, es: false },
      ],
    };

    const expectedFlattened = {
      test: 'Testing',
      keywords: ['one', 'two', '2', 'cuatro', '4', false, '6'],
    };

    const expectedLocales = {
      es: { keywords: { 2: 'tres', 4: 'cinco', 6: false } },
      en: { keywords: { 2: 'three', 4: 'five', 6: true } },
    };

    const { flattened, locales } = getFlattenedObjectAndLocales(subject);

    expect(flattened).toEqual(expectedFlattened);
    expect(locales).toEqual(expectedLocales);
  });

  it('should return array in flattened when provided parameter is array', () => {
    const subject = [
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
      false,
      { en: true, es: false },
    ];

    const expectedFlattened = ['one', 'two', '2', 'cuatro', '4', false, '6'];
    const expectedLocales = {
      es: { 2: 'tres', 4: 'cinco', 6: false },
      en: { 2: 'three', 4: 'five', 6: true },
    };

    const { flattened, locales } = getFlattenedObjectAndLocales(subject);

    expect(flattened).toEqual(expectedFlattened);
    expect(locales).toEqual(expectedLocales);
  });
});
