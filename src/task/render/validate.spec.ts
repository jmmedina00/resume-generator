import { RenderContext } from '../context';
import { validateContextContents } from './validate';

describe('Validate tasks', () => {
  it('should run validation of the context contents with context function', async () => {
    const validator = jest.fn().mockResolvedValue({});
    const context: RenderContext = {
      path: 'foo/bar',
      contents: 'qwerty',
      prettierOptions: {},
      validateFn: validator,
    };

    await validateContextContents(context);
    expect(validator).toHaveBeenCalledWith('qwerty');
  });
});
