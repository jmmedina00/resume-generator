import { getPrivateVersionGenerator } from './gen-private';

describe('Private version generation', () => {
  it('should produce as many versions as private iterations, only appending to basics incrementally', () => {
    const basics = {
      name: 'Juanmi',
      surname: 'Medina',
    };

    const privateIterations = [
      {
        phoneNumber: '555-5118',
        email: 'juanmi@medina.com',
      },
      {
        name: 'Juan Miguel',
        greencard: 'foo',
        insurance: 'bar',
      },
    ];

    const otherSections = {
      work: { foo: 'bar', baz: 'gen' },
      education: { school: { name: 'Studies' } },
    };

    const inputResume = { basics, ...otherSections };

    const expectedResumes = [
      {
        basics: {
          name: 'Juanmi',
          surname: 'Medina',
          phoneNumber: '555-5118',
          email: 'juanmi@medina.com',
        },
        ...otherSections,
      },
      {
        basics: {
          name: 'Juan Miguel',
          surname: 'Medina',
          phoneNumber: '555-5118',
          email: 'juanmi@medina.com',
          greencard: 'foo',
          insurance: 'bar',
        },
        ...otherSections,
      },
    ];

    const generator = getPrivateVersionGenerator(privateIterations);
    const actualResumes = generator(inputResume);

    expect(actualResumes).toEqual(expectedResumes);
  });

  it('should complete replace pre-existing complex object with private version one', () => {
    const basics = {
      test: 'foo',
      location: {
        name: 'Exist',
        city: 'Malaga',
      },
    };

    const privateIterations = [
      {
        location: {
          address: 'Test',
          postalCode: '00000',
        },
      },
    ];

    const expected = [
      {
        basics: {
          test: 'foo',
          location: {
            address: 'Test',
            postalCode: '00000',
          },
        },
      },
    ];

    const actual = getPrivateVersionGenerator(privateIterations)({ basics });
    expect(actual).toEqual(expected);
  });

  it('should use the append field to add to plain fields', () => {
    const basics = {
      summary: "I'm a potato",
      label: 'Veggie',
      foo: 'bar',
    };

    const privateIterations = [
      {
        location: 'Wherever',
        append: {
          label: ' that is brown',
        },
      },
      {
        phone: '555-5118',
        append: {
          summary: '-harvester',
        },
      },
    ];

    const expected = [
      {
        basics: {
          summary: "I'm a potato",
          label: 'Veggie that is brown',
          foo: 'bar',
          location: 'Wherever',
        },
      },
      {
        basics: {
          summary: "I'm a potato-harvester",
          label: 'Veggie that is brown',
          foo: 'bar',
          location: 'Wherever',
          phone: '555-5118',
        },
      },
    ];
    const actual = getPrivateVersionGenerator(privateIterations)({ basics });
    expect(actual).toEqual(expected);
  });

  it("should be able to copy append field value if it doesn't exist yet", () => {
    const basics = {
      summary: "I'm a potato",
      label: 'Veggie',
      foo: 'bar',
    };

    const privateIterations = [
      {
        location: 'Wherever',
        append: {
          label: ' that is brown',
          bar: 'baz',
        },
      },
    ];

    const expected = [
      {
        basics: {
          summary: "I'm a potato",
          label: 'Veggie that is brown',
          foo: 'bar',
          location: 'Wherever',
          bar: 'baz',
        },
      },
    ];
    const actual = getPrivateVersionGenerator(privateIterations)({ basics });
    expect(actual).toEqual(expected);
  });

  it('should not admit append section with object fields', () => {
    const basics = {
      summary: "I'm a potato",
      label: 'Veggie',
      foo: 'bar',
    };

    const privateIterations = [
      {
        location: 'Wherever',
        append: {
          label: ' that is brown',
        },
      },
      {
        phone: '555-5118',
        append: {
          summary: '-harvester',
          donot: { do: 'this' },
        },
      },
    ];

    expect(() => {
      getPrivateVersionGenerator(privateIterations)({ basics });
    }).toThrow();
  });

  it('should not be able to append to complex field', () => {
    const basics = {
      test: 'foo',
      location: {
        name: 'Exist',
        city: 'Malaga',
      },
    };

    const privateIterations = [
      {
        append: {
          location: 'Wut',
        },
      },
    ];

    expect(() => {
      getPrivateVersionGenerator(privateIterations)({ basics });
    }).toThrow();
  });
});
