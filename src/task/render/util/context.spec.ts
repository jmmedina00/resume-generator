import type { RenderContext } from '../../context';
import { appendToObjectResource, setIntoContext } from './context';

describe('Rendering context treating functions', () => {
  it('should be able to write any string to render context resources', () => {
    const context: RenderContext = {
      path: '',
      resources: {},
      contents: Buffer.of(),
    };

    const expectedFinalContext: RenderContext = {
      path: '',
      resources: { stuff: 'Some random stuff' },
      contents: Buffer.of(),
    };

    setIntoContext('stuff')('Some random stuff', context);
    expect(context).toEqual(expectedFinalContext);
  });

  it('should replace key in resources containing JSON with another JSON = original + appended', () => {
    const context: RenderContext = {
      path: '',
      resources: { test: JSON.stringify({ foo: 'bar', bar: 'baz' }) },
      contents: Buffer.of(),
    };

    const expectedFinalContext: RenderContext = {
      path: '',
      resources: {
        test: JSON.stringify({ foo: 'bar', bar: 'baz', baz: 're' }),
      },
      contents: Buffer.of(),
    };

    appendToObjectResource('test', { baz: 're' })(context);
    expect(context).toEqual(expectedFinalContext);
  });
});
