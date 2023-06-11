import { format } from 'prettier';
import { adaptPrettierFormat } from './transform';

jest.mock('prettier');

describe('Prettier format applying', () => {
  it('should adapt Prettier format for use with transformers', async () => {
    (format as jest.Mock).mockReturnValue('formatted');
    const source = 'src';
    const options = JSON.stringify({ foo: 'bar', bar: 'baz' });

    const result = await adaptPrettierFormat(source, options);
    expect(result).toEqual('formatted');
    expect(format).toHaveBeenCalledWith(source, { foo: 'bar', bar: 'baz' });
  });
});
