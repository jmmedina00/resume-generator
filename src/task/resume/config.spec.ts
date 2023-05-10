import { Options, resolveConfig } from 'prettier';
import { RenderContext } from '../context';
import { getResumeRenderConfig } from './config';

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
  it('should provide Prettier options and resume schema validator', async () => {
    const options: Options = { trailingComma: 'es5' };
    (resolveConfig as unknown as jest.Mock).mockResolvedValue(options);

    const { prettierOptions, validateFn } =
      (await getResumeRenderConfig()) as RenderContext;

    const validationResult = await validateFn('foobarbaz');
    expect(prettierOptions).toEqual(options);
    expect(validationResult).toEqual('foobarbaz is valid');

    expect(resolveConfig as unknown as jest.Mock).toHaveBeenCalledWith(
      '.prettierrc'
    );
  });
});
