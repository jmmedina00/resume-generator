import type { RenderContext } from '../context';
import { setIntoContext } from './util';
import { makeResourceFromExistingWithFn } from './transform';

jest.mock('./util');

describe('Rendering transform tasks', () => {
  it('should be able to make a transformation with a function that takes several parameters', async () => {
    const transformFn = jest
      .fn()
      .mockImplementation((foo: string, bar: string) => foo + bar);
    const setter = jest.fn();
    (setIntoContext as jest.Mock).mockReturnValue(setter);

    const context: RenderContext = {
      path: '',
      resources: { test: 'This is a test', prueba: 'Esto es una prueba' },
      contents: Buffer.of(),
    };

    const task = makeResourceFromExistingWithFn(
      ['test', 'prueba'],
      'result',
      transformFn
    );
    await task(context);
    expect(setIntoContext).toHaveBeenCalledWith('result');
    expect(setter).toHaveBeenCalledWith(
      'This is a testEsto es una prueba',
      context
    );
  });
});
