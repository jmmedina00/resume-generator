import { checkVersionAgainstSchema } from './schema';

jest.mock('resume-schema', () => ({
  // Successful callback function, turned into promise by promisify
  validate: jest
    .fn()
    .mockImplementation((value, callback: Function) =>
      callback(null, `${value} is valid`)
    ),
}));

describe('Resume schema', () => {
  it('should be applied to provided data', async () => {
    const object = { foo: 'nar', bar: 'baz' };
    const task = checkVersionAgainstSchema(object);
    await task();

    const schema = require('resume-schema');
    expect(schema.validate).toHaveBeenCalledWith(
      { ...object },
      expect.anything()
    );
  });
});
