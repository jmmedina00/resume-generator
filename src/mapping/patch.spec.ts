import { patchObject } from './patch';

describe('Item patching', () => {
  it('should apply available translations to object', () => {
    const object = { test: 'test', field: 'field', meow: 'Meow' };
    const translations = { test: 'Prueba', meow: 'Maullido' };

    const expected = { test: 'Prueba', field: 'field', meow: 'Maullido' };
    const actual = patchObject(object, translations);
    expect(actual).toEqual(expected);
  });

  it('should apply translations to nested objects', () => {
    const object = {
      name: 'Juanmi',
      address: {
        street: 'street',
        city: 'Malaga',
      },
      projects: {
        devJob: {
          name: 'name',
          description: 'description',
          startDate: 'today',
        },
        consulting: {
          name: 'name',
          endDate: '2021',
        },
      },
    };

    const translations = {
      address: {
        street: 'Piruleta',
      },
      projects: {
        devJob: {
          name: 'Desarrollador web',
          description: 'Programador',
        },
        consulting: {
          name: 'Consultor',
        },
      },
    };

    const expected = {
      name: 'Juanmi',
      address: {
        street: 'Piruleta',
        city: 'Malaga',
      },
      projects: {
        devJob: {
          name: 'Desarrollador web',
          description: 'Programador',
          startDate: 'today',
        },
        consulting: {
          name: 'Consultor',
          endDate: '2021',
        },
      },
    };

    const actual = patchObject(object, translations);
    expect(actual).toEqual(expected);
  });

  it('should apply translations to a single array', () => {
    const object = ['dev', '1', '2', 'end'];
    const translations = {
      1: 'árbol',
      2: 'genealógico',
    };

    const expected = ['dev', 'árbol', 'genealógico', 'end'];
    const actual = patchObject(object, translations);
    expect(actual).toEqual(expected);
  });

  it('should apply translations to array within object', () => {
    const object = {
      name: 'juanmi',
      keywords: ['0', 'coder', '2', 'computer'],
    };

    const translations = {
      keywords: {
        0: 'Programador',
        2: 'Trabajo',
      },
    };

    const expected = {
      name: 'juanmi',
      keywords: ['Programador', 'coder', 'Trabajo', 'computer'],
    };

    const actual = patchObject(object, translations);
    expect(actual).toEqual(expected);
  });

  it('should not apply translations for fields that are missing in object', () => {
    const object = { position: 'position', level: 'level' };
    const translations = {
      position: 'Programador',
      level: 'Junior',
      startedAt: 'El año pasado',
    };

    const expected = { position: 'Programador', level: 'Junior' };
    const actual = patchObject(object, translations);
    expect(actual).toEqual(expected);
  });
});
