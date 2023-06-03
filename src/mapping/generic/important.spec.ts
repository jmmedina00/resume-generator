import {
  INCLUDE_EVERYTHING,
  INCLUDE_IMPORTANT_ONLY,
  handleImportantFlags,
} from './important';

describe('Important handling', () => {
  describe('when everything is wanted', () => {
    it('should keep object as is when no important flag is missing', () => {
      const object = { foo: 'bar', baz: 12, fizz: true };
      const result = handleImportantFlags(object, INCLUDE_EVERYTHING);
      expect(result).toEqual(object);
      expect(result).not.toBe(object);
    });

    it('should remove important flag from object', () => {
      const object = { foo: 'bar', baz: 12, fizz: true, important: false };
      const expected = { foo: 'bar', baz: 12, fizz: true };

      const actual = handleImportantFlags(object, INCLUDE_EVERYTHING);
      expect(actual).toEqual(expected);
    });

    it('should remove important flag from nested object', () => {
      const object = {
        data: {
          important: true,
          sum: 123,
          name: 'test',
          ignoreme: false,
        },
        sa: {
          name: 'testing',
          meta: {
            important: true,
            hue: 45,
          },
        },
      };

      const expected = {
        data: {
          sum: 123,
          name: 'test',
          ignoreme: false,
        },
        sa: {
          name: 'testing',
          meta: {
            hue: 45,
          },
        },
      };

      const actual = handleImportantFlags(object, INCLUDE_EVERYTHING);
      expect(actual).toEqual(expected);
    });

    it('should remove important flag from object item in array', () => {
      const object = [
        { important: true, foo: 'bar' },
        { foo: 'baz' },
        { foo: 're', important: false },
      ];

      const expected = [{ foo: 'bar' }, { foo: 'baz' }, { foo: 're' }];
      const actual = handleImportantFlags(object, INCLUDE_EVERYTHING);
      expect(actual).toEqual(expected);
    });

    it('should remove important flag from object item in object array', () => {
      const object = {
        foo: 'bar',
        items: [
          { important: true, foo: 'bar' },
          { foo: 'baz' },
          { foo: 're', important: false },
        ],
      };

      const expected = {
        foo: 'bar',
        items: [{ foo: 'bar' }, { foo: 'baz' }, { foo: 're' }],
      };

      const actual = handleImportantFlags(object, INCLUDE_EVERYTHING);
      expect(actual).toEqual(expected);
    });

    it('should not keep empty objects', () => {
      const object = {
        foo: 'bar',
        wut: {
          important: false,
        },
      };

      const expected = { foo: 'bar' };
      const actual = handleImportantFlags(object, INCLUDE_EVERYTHING);
      expect(actual).toEqual(expected);
    });
  });

  describe('when only important things are wanted', () => {
    it('should keep object as is, assuming missing flag as true', () => {
      const object = { foo: 'bar', baz: 12, fizz: true };
      const result = handleImportantFlags(object, INCLUDE_IMPORTANT_ONLY);
      expect(result).toEqual(object);
      expect(result).not.toBe(object);
    });

    it('should return object minus important flag when explicitly set to true', () => {
      const object = { foo: 'bar', baz: 12, fizz: true, important: true };
      const expected = { foo: 'bar', baz: 12, fizz: true };

      const actual = handleImportantFlags(object, INCLUDE_IMPORTANT_ONLY);
      expect(actual).toEqual(expected);
    });

    it('should return empty object when important flag is set to false', () => {
      const object = { foo: 'bar', baz: 12, fizz: true, important: false };

      const actual = handleImportantFlags(object, INCLUDE_IMPORTANT_ONLY);
      expect(actual).toEqual({});
    });

    it('should exclude nested objects that have important flag set to false', () => {
      const object = {
        data: {
          important: false,
          sum: 123,
          name: 'test',
          ignoreme: false,
        },
        sa: {
          name: 'testing',
          meta: {
            important: false,
            hue: 45,
          },
        },
      };

      const expected = {
        sa: {
          name: 'testing',
        },
      };

      const actual = handleImportantFlags(object, INCLUDE_IMPORTANT_ONLY);
      expect(actual).toEqual(expected);
    });

    it('should exclude array items that have important flag set to false', () => {
      const object = [
        { important: true, foo: 'bar' },
        { foo: 'baz' },
        { foo: 're', important: false },
      ];

      const expected = [{ foo: 'bar' }, { foo: 'baz' }];
      const actual = handleImportantFlags(object, INCLUDE_IMPORTANT_ONLY);
      expect(actual).toEqual(expected);
    });

    it('should exclude array items in (nested) object array', () => {
      const object = {
        foo: 'bar',
        baz: [
          { important: false, foo: 'bar' },
          { foo: 'baz' },
          { foo: 're', important: true },
        ],
        re: {
          la: 'shi',
          data: [
            { important: true, foo: 'bar' },
            { foo: 'baz' },
            { foo: 're', important: false },
          ],
        },
      };

      const expected = {
        foo: 'bar',
        baz: [{ foo: 'baz' }, { foo: 're' }],
        re: {
          la: 'shi',
          data: [{ foo: 'bar' }, { foo: 'baz' }],
        },
      };

      const actual = handleImportantFlags(object, INCLUDE_IMPORTANT_ONLY);
      expect(actual).toEqual(expected);
    });
  });
});
