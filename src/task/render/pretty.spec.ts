import { RenderContext } from '../context';
import { format } from 'prettier';
import { prettifyContentsofContext } from './pretty';

jest.mock('prettier');

describe('Prettify tasks', () => {
  it('should replace contents of context with prettified contents', async () => {
    const validateFn = jest.fn();
    (format as jest.Mock).mockReturnValue('Das pretty');

    const context: RenderContext = {
      path: 'foo/bar',
      contents: "{'test': 12, 'foo':'bar'}",
      preprocessFn: validateFn,
      prettierOptions: { endOfLine: 'auto', quoteProps: 'as-needed' },
    };

    const expectedContext: RenderContext = {
      ...context,
      contents: 'Das pretty',
    };

    await prettifyContentsofContext(context);
    expect(context).toEqual(expectedContext);
    expect(format).toHaveBeenCalledWith("{'test': 12, 'foo':'bar'}", {
      endOfLine: 'auto',
      quoteProps: 'as-needed',
    });
  });
});
