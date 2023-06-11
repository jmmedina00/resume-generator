import { ListrTaskWrapper } from 'listr2';
import { getRecursiveFileList } from '../../util/io';
import { TaskYielder, render } from '../render';
import { getMarkdownRenderingTasks } from '.';
import { getYielders } from './yielder';

jest.mock('../../util/io');
jest.mock('../render');
jest.mock('./yielder');
jest.mock('../io/task');

describe('Markdown rendering tasks', () => {
  it('should be generated according to files present in folder', async () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    const paths = [
      './folder/file.md',
      './folder/test.txt',
      './generated.rtf',
      './folder/sub/resume.json',
      './lessons/summary.md',
      './test.md',
      './do/not/enter/secret.md',
    ];

    (getYielders as jest.Mock).mockImplementation((path) => [
      (foo: any) => ({ title: 'Do everything with ' + path, task: 'fizzbuzz' }),
    ]);
    (getRecursiveFileList as jest.Mock).mockResolvedValue(paths);
    (render as jest.Mock).mockImplementation(
      (path: string, contents: string, yielders: TaskYielder[]) => ({
        path,
        contents,
        tasks: yielders.flatMap((yielder) =>
          yielder({} as ListrTaskWrapper<any, any>)
        ),
      })
    );

    const expectedTasks = [
      {
        title: './folder/file.md',
        task: {
          path: './folder/file.md.html',
          contents: 'fromfile',
          tasks: [
            { title: 'Do everything with ./folder/file.md', task: 'fizzbuzz' },
          ],
        },
      },
      {
        title: './lessons/summary.md',
        task: {
          path: './lessons/summary.md.html',
          contents: 'fromfile',
          tasks: [
            {
              title: 'Do everything with ./lessons/summary.md',
              task: 'fizzbuzz',
            },
          ],
        },
      },
      {
        title: './test.md',
        task: {
          path: './test.md.html',
          contents: 'fromfile',
          tasks: [{ title: 'Do everything with ./test.md', task: 'fizzbuzz' }],
        },
      },
      {
        title: './do/not/enter/secret.md',
        task: {
          path: './do/not/enter/secret.md.html',
          contents: 'fromfile',
          tasks: [
            {
              title: 'Do everything with ./do/not/enter/secret.md',
              task: 'fizzbuzz',
            },
          ],
        },
      },
    ];

    const task = getMarkdownRenderingTasks('./myfolder');
    await task(null, providedTask as ListrTaskWrapper<any, any>);

    expect(lister).toHaveBeenCalledWith(expectedTasks, expect.anything());
    expect(getRecursiveFileList).toHaveBeenCalledWith('./myfolder');
  });
});
