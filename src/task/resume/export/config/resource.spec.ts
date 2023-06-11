import type { ListrTaskWrapper } from 'listr2';
import { makeResourceFromExistingWithFn } from '../../../render/transform';
import { ResourceApplier, makeResourceApplier } from './resource';

jest.mock('../../../render/transform');
jest.mock('../../../io/task');

describe('Config resource helpers', () => {
  it('should provide ready-made yielder with properly wrapped sync function', async () => {
    const fn = jest.fn().mockReturnValue('This is actually sync');

    (makeResourceFromExistingWithFn as jest.Mock).mockImplementation(
      (source, target, asyncFn) => ({ source, target, asyncFn })
    );

    const applier: ResourceApplier = {
      title: 'This is a test',
      sourceKeys: ['foo', 'bar'],
      targetKey: 'baz',
      syncFn: fn,
    };

    const expectedTasks = [
      {
        title: 'This is a test',
        task: {
          source: ['foo', 'bar'],
          target: 'baz',
          asyncFn: expect.anything(),
        },
      },
    ];

    const yielder = makeResourceApplier(applier);
    const tasks = yielder({} as ListrTaskWrapper<any, any>);
    expect(tasks).toEqual(expectedTasks);

    const asyncFn = (tasks[0]['task'] as any)['asyncFn'];
    const asyncResult = await asyncFn('foo', 'bar');

    expect(asyncResult).toEqual('This is actually sync');
    expect(fn).toHaveBeenCalledWith('foo', 'bar');
  });
});
