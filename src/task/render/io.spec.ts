import { RenderContext } from '../context';
import { writeToFile } from '../io/write';
import { writeContextToFile } from './io';

jest.mock('../io/write');

describe('Rendering wrapper tasks', () => {
  it('should manually get and call file writing', async () => {
    const writer = jest.fn();
    (writeToFile as jest.Mock).mockReturnValue(writer);

    const context: RenderContext = {
      path: 'foo/bar',
      contents: Buffer.from('why dis not work on its own'),
      prettierOptions: {},
      preprocessFn: jest.fn(),
    };

    await writeContextToFile(context);
    const [path, fn] = (writeToFile as jest.Mock).mock.calls[0];

    expect(path).toEqual('foo/bar');
    expect(fn(context)).toEqual(Buffer.from('why dis not work on its own'));

    expect(writer).toHaveBeenCalledWith(context);
  });
});
