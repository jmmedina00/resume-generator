import type { RenderContext } from '../context';
import type { ListrTask, ListrTaskWrapper } from 'listr2';
import {
  getLocalAssetGatheringYielder,
  getLocalAssetIntoContextTask,
} from './assets';
import { readLocalFile } from '../io/read';
import { setIntoContext } from './util';

jest.mock('fs/promises');
jest.mock('./util');
jest.mock('../io/read');
jest.mock('../io/task');

describe('Rendering asset tasks', () => {
  (setIntoContext as jest.Mock).mockImplementation((key) => ({ key }));
  (readLocalFile as jest.Mock).mockImplementation((fn, path) => ({
    ...fn,
    path,
  }));

  it('should get appropriate file reading task with correct processor', () => {
    const task = getLocalAssetIntoContextTask('myfile', './foo/bar.txt');
    expect(task).toEqual({ key: 'myfile', path: './foo/bar.txt' });
  });

  it('should get yielder for a whole asset declaration', () => {
    const declaration = {
      foo: './foobar/foo.txt',
      bar: './foobar/bar.html',
      baz: './script/baz.sql',
    };

    const expectedTasks = [
      {
        title: './foobar/foo.txt',
        task: { key: 'foo', path: './foobar/foo.txt' },
      },
      {
        title: './foobar/bar.html',
        task: { key: 'bar', path: './foobar/bar.html' },
      },
      {
        title: './script/baz.sql',
        task: { key: 'baz', path: './script/baz.sql' },
      },
    ];

    const tasks: ListrTask<RenderContext>[] = getLocalAssetGatheringYielder(
      declaration
    )(null as unknown as ListrTaskWrapper<any, any>);

    expect(tasks).toEqual(expectedTasks);
  });
});
