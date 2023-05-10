import { RenderContext } from '../context';
import { validateContextContents } from './validate';

describe('Validate tasks', () => {
  it('should run validation of the context contents as object with context function', async () => {
    const object = { foo: 'nar', bar: 'baz' };

    const validator = jest.fn().mockResolvedValue({});
    const context: RenderContext = {
      path: 'foo/bar',
      contents: JSON.stringify(object),
      prettierOptions: {},
      validateFn: validator,
    };

    await validateContextContents(context);
    expect(validator).toHaveBeenCalledWith({ ...object });
  });
});
