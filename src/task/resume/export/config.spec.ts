import type { RenderContext } from '../../context';
import { validateResumeWithSchema } from './config';

jest.mock('fs/promises');
jest.mock('prettier');
jest.mock('resume-schema', () => ({
  // Successful callback function, turned into promise by promisify
  validate: jest
    .fn()
    .mockImplementation((value, callback: Function) =>
      callback(null, `${value} is valid`)
    ),
}));

describe('Resume rendering config', () => {
  it.skip('should parse resume and validate it against schema', async () => {
    const object = { foo: 'nar', bar: 'baz' };

    const context: RenderContext = {
      path: 'foo/bar',
      resources: {},
      contents: Buffer.from(JSON.stringify(object)),
      prettierOptions: {},
      preprocessFn: jest.fn(),
    };

    await validateResumeWithSchema(context);

    const schema = require('resume-schema');
    expect(schema.validate).toHaveBeenCalledWith(
      { ...object },
      expect.anything()
    );
  });
});
