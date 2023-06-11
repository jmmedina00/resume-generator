import type { ListrTaskWrapper } from 'listr2';
import { makeResourceFromExistingWithFn } from '../../transform';
import { applyMustacheTemplateToResource } from './transform';
import { applyTemplateToObjectResource } from '.';

jest.mock('../../transform');
jest.mock('./transform');

describe('Template yielders', () => {
  it('should provide applying template parameters with given functions', () => {
    (makeResourceFromExistingWithFn as jest.Mock).mockImplementation(
      (keys: any, target: any, fn: any) => ({ keys, target, fn })
    );

    (applyMustacheTemplateToResource as jest.Mock).mockImplementation(
      (funcs: any) => funcs
    );

    const foo = jest.fn();
    const bar = jest.fn();

    const expectedTasks = [
      {
        title: 'Apply template foo with object bar to target baz',
        task: {
          keys: ['foo', 'bar'],
          target: 'baz',
          fn: {
            foo,
            bar,
          },
        },
      },
    ];

    const yielder = applyTemplateToObjectResource(
      { template: 'foo', json: 'bar', target: 'baz' },
      { foo, bar }
    );
    const tasks = yielder({} as ListrTaskWrapper<any, any>);
    expect(tasks).toEqual(expectedTasks);
  });
});
