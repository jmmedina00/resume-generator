import { ListrTaskWrapper } from 'listr2';
import { getRenderingTasks } from '.';
import type { RenderContext } from '../context';
import { writeContextToFile } from './util';

describe('Rendering index', () => {
  it('should consolidate render parameters and additional yielders into task list initialized with correct context', () => {
    const lister = jest.fn().mockReturnValue({ listed: true });
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    const yielderFoo = jest.fn().mockReturnValue([
      { title: 'foo', task: 'bar' },
      { title: 'bar', task: 'baz' },
    ]);
    const yielderBar = jest
      .fn()
      .mockReturnValue([{ title: 'fizz', task: 'buzz' }]);

    const expectedTasks = [
      { title: 'foo', task: 'bar' },
      { title: 'bar', task: 'baz' },
      { title: 'fizz', task: 'buzz' },
      { title: 'Write to file', task: writeContextToFile },
    ];

    const expectedContext: RenderContext = {
      path: './foo/bar.html',
      resources: { src: 'start' },
      contents: Buffer.of(),
    };

    const task = getRenderingTasks('./foo/bar.html', 'start', [
      yielderFoo,
      yielderBar,
    ]);
    task(null, providedTask as ListrTaskWrapper<any, any>);

    expect(lister).toHaveBeenCalledWith(expectedTasks, {
      ctx: expectedContext,
      concurrent: false,
    });
  });
});
