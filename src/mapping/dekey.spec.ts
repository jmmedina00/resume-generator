import { dekeyObject } from './dekey';
import { LocalisedObject } from './locale.types';

describe('Object dekeying', () => {
  it('should return flattened as array and turn defaulted fields into previous key', () => {
    const locales: LocalisedObject = {
      flattened: {
        gardening: {
          name: 'name',
          start: '2000',
          summary: 'summary',
          test: 'wut',
        },
        lumberjack: {
          name: 'name',
          start: '2005',
          summary: 'summary',
          test: 'khe',
        },
      },
      locales: {
        en: {
          gardening: {
            name: 'Gardening',
            summary: 'Doing garden-keeping tasks',
          },
          lumberjack: {
            name: 'Lumberjack',
            summary: 'Cutting wood, caring for forests',
          },
        },
        es: {
          gardening: {
            name: 'Jardinería',
            summary: 'Cuidar de jardines y plants',
          },
          lumberjack: {
            name: 'Leñador',
            summary: 'Talar árboles, guardabosques',
          },
        },
      },
    };

    const expected = [
      { name: 'gardening', start: '2000', summary: 'gardening', test: 'wut' },
      { name: 'lumberjack', start: '2005', summary: 'lumberjack', test: 'khe' },
    ];

    const { flattened: actual } = dekeyObject(locales, ['name', 'summary']);
    expect(actual).toEqual(expected);
  });

  it('should transform locales accordingly into array-suitable, but keep inner contents intact', () => {
    const locales: LocalisedObject = {
      flattened: {
        gardening: {
          name: 'name',
          start: '2000',
          summary: 'summary',
          test: 'wut',
        },
        lumberjack: {
          name: 'name',
          start: '2005',
          summary: 'summary',
          test: 'khe',
        },
      },
      locales: {
        en: {
          gardening: {
            name: 'Gardening',
            summary: 'Doing garden-keeping tasks',
          },
          lumberjack: {
            name: 'Lumberjack',
            summary: 'Cutting wood, caring for forests',
          },
        },
        es: {
          gardening: {
            name: 'Jardinería',
            summary: 'Cuidar de jardines y plants',
          },
          lumberjack: {
            name: 'Leñador',
            summary: 'Talar árboles, guardabosques',
          },
        },
      },
    };

    const expected = {
      en: {
        0: {
          name: 'Gardening',
          summary: 'Doing garden-keeping tasks',
        },
        1: {
          name: 'Lumberjack',
          summary: 'Cutting wood, caring for forests',
        },
      },
      es: {
        0: {
          name: 'Jardinería',
          summary: 'Cuidar de jardines y plants',
        },
        1: {
          name: 'Leñador',
          summary: 'Talar árboles, guardabosques',
        },
      },
    };

    const { locales: actual } = dekeyObject(locales, ['name', 'summary']);
    expect(actual).toEqual(expected);
  });

  it('should not add keys that did not already exist in the original object', () => {
    const locales: LocalisedObject = {
      flattened: {
        gardening: {
          name: 'name',
          start: '2000',
          summary: 'summary',
          test: 'wut',
        },
        lumberjack: {
          name: 'name',
          start: '2005',
          summary: 'summary',
          test: 'khe',
        },
      },
      locales: {
        en: {
          gardening: {
            name: 'Gardening',
            summary: 'Doing garden-keeping tasks',
          },
          lumberjack: {
            name: 'Lumberjack',
            summary: 'Cutting wood, caring for forests',
          },
        },
        es: {
          gardening: {
            name: 'Jardinería',
            summary: 'Cuidar de jardines y plants',
          },
          lumberjack: {
            name: 'Leñador',
            summary: 'Talar árboles, guardabosques',
          },
        },
      },
    };

    const expected = [
      { name: 'gardening', start: '2000', summary: 'gardening', test: 'wut' },
      { name: 'lumberjack', start: '2005', summary: 'lumberjack', test: 'khe' },
    ];

    const { flattened: actual } = dekeyObject(locales, [
      'name',
      'summary',
      'bogus',
    ]);
    expect(actual).toEqual(expected);
  });

  it('should not accept trying to default nested properties', () => {
    const locales: LocalisedObject = {
      flattened: {
        gardening: {
          location: {
            city: 'Malaga',
            country: 'ES',
            shortname: 'shortname',
          },
          name: 'name',
          start: '2000',
          summary: 'summary',
          test: 'wut',
        },
        lumberjack: {
          location: {
            city: 'London',
            country: 'UK',
            shortname: 'shortname',
          },
          name: 'name',
          start: '2005',
          summary: 'summary',
          test: 'khe',
        },
      },
      locales: {
        en: {
          gardening: {
            location: {
              shortname: 'Málaga',
            },
            name: 'Gardening',
            summary: 'Doing garden-keeping tasks',
          },
          lumberjack: {
            location: {
              shortname: 'London',
            },
            name: 'Lumberjack',
            summary: 'Cutting wood, caring for forests',
          },
        },
        es: {
          gardening: {
            location: {
              shortname: 'Málaga',
            },
            name: 'Jardinería',
            summary: 'Cuidar de jardines y plants',
          },
          lumberjack: {
            location: {
              shortname: 'Londres',
            },
            name: 'Leñador',
            summary: 'Talar árboles, guardabosques',
          },
        },
      },
    };

    expect(() => {
      dekeyObject(locales, ['name', 'location.shortname']);
    }).toThrow();
  });

  it('should not accept trying to default properties that are not strings', () => {
    const locales: LocalisedObject = {
      flattened: {
        gardening: {
          location: {
            city: 'Malaga',
            country: 'ES',
            shortname: 'shortname',
          },
          name: 'name',
          start: '2000',
          summary: 'summary',
          test: 'wut',
        },
        lumberjack: {
          location: {
            city: 'London',
            country: 'UK',
            shortname: 'shortname',
          },
          name: 'name',
          start: '2005',
          summary: 'summary',
          test: 'khe',
        },
      },
      locales: {
        en: {
          gardening: {
            location: {
              shortname: 'Málaga',
            },
            name: 'Gardening',
            summary: 'Doing garden-keeping tasks',
          },
          lumberjack: {
            location: {
              shortname: 'London',
            },
            name: 'Lumberjack',
            summary: 'Cutting wood, caring for forests',
          },
        },
        es: {
          gardening: {
            location: {
              shortname: 'Málaga',
            },
            name: 'Jardinería',
            summary: 'Cuidar de jardines y plants',
          },
          lumberjack: {
            location: {
              shortname: 'Londres',
            },
            name: 'Leñador',
            summary: 'Talar árboles, guardabosques',
          },
        },
      },
    };

    expect(() => {
      dekeyObject(locales, ['name', 'location']);
    }).toThrow();
  });

  it('should be able to process map with nested maps if called correctly', () => {
    const locales: LocalisedObject = {
      flattened: {
        gardening: {
          location: {
            city: 'Malaga',
            country: 'ES',
            shortname: 'shortname',
          },
          name: 'name',
          start: '2000',
          summary: 'summary',
          test: 'wut',
        },
        lumberjack: {
          location: {
            city: 'London',
            country: 'UK',
            shortname: 'shortname',
          },
          name: 'name',
          start: '2005',
          summary: 'summary',
          test: 'khe',
        },
      },
      locales: {
        en: {
          gardening: {
            location: {
              shortname: 'Málaga',
            },
            name: 'Gardening',
            summary: 'Doing garden-keeping tasks',
          },
          lumberjack: {
            location: {
              shortname: 'London',
            },
            name: 'Lumberjack',
            summary: 'Cutting wood, caring for forests',
          },
        },
        es: {
          gardening: {
            location: {
              shortname: 'Málaga',
            },
            name: 'Jardinería',
            summary: 'Cuidar de jardines y plants',
          },
          lumberjack: {
            location: {
              shortname: 'Londres',
            },
            name: 'Leñador',
            summary: 'Talar árboles, guardabosques',
          },
        },
      },
    };

    const expected = [
      {
        location: {
          city: 'Malaga',
          country: 'ES',
          shortname: 'shortname',
        },
        name: 'gardening',
        start: '2000',
        summary: 'summary',
        test: 'wut',
      },
      {
        location: {
          city: 'London',
          country: 'UK',
          shortname: 'shortname',
        },
        name: 'lumberjack',
        start: '2005',
        summary: 'summary',
        test: 'khe',
      },
    ];

    const { flattened: actual } = dekeyObject(locales, ['name']);
    expect(actual).toEqual(expected);
  });
});
