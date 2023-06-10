import { format } from 'prettier';
import { adaptPrettierFormat, prettifyContentsofContext } from './pretty';

jest.mock('prettier');

describe('Prettify tasks', () => {
  /* it('should replace contents of context with prettified contents', async () => {
    const validateFn = jest.fn();
    (format as jest.Mock).mockReturnValue('Das pretty');

    const context: RenderContext = {
      path: 'foo/bar',
      contents: Buffer.from("{'test': 12, 'foo':'bar'}"),
      preprocessFn: validateFn,
      prettierOptions: { endOfLine: 'auto', quoteProps: 'as-needed' },
    };

    const expectedContext: RenderContext = {
      ...context,
      contents: Buffer.from('Das pretty'),
    };

    await prettifyContentsofContext(context);
    expect(context).toEqual(expectedContext);
    expect(format).toHaveBeenCalledWith("{'test': 12, 'foo':'bar'}", {
      endOfLine: 'auto',
      quoteProps: 'as-needed',
    });
  }); */

  it('should adapt Prettier format for use with transformers', async () => {
    (format as jest.Mock).mockReturnValue('formatted');
    const source = 'src';
    const options = JSON.stringify({ foo: 'bar', bar: 'baz' });

    const result = await adaptPrettierFormat(source, options);
    expect(result).toEqual('formatted');
    expect(format).toHaveBeenCalledWith(source, { foo: 'bar', bar: 'baz' });
  });
});
