import { Options, resolveConfig } from 'prettier';
import { RenderContext } from '../../context';
import { getPrettierOptions, validateResumeWithSchema } from './config';

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
  it('should provide Prettier options from lib as-is', async () => {
    const options: Options = { trailingComma: 'es5' };
    (resolveConfig as unknown as jest.Mock).mockResolvedValue(options);

    const actualOptions = await getPrettierOptions();
    expect(actualOptions).toEqual(options);
  });

  it('should parse resume and validate it against schema', async () => {
    const object = { foo: 'nar', bar: 'baz' };

    const context: RenderContext = {
      path: 'foo/bar',
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
