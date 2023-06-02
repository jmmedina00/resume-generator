import { ListrTaskWrapper } from 'listr2';
import { getRecursiveFileList } from '../../util/io';
import { Options } from 'prettier';
import { getPrettierOptions } from '../resume/export/config';
import { getRenderingTasks } from '../render';
import { parseMarkdownIntoDocument } from './render';
import { getMarkdownRenderingTasks } from '.';
import { readFile } from 'fs/promises';

jest.mock('../resume/export/config');
jest.mock('../../util/io');
jest.mock('../render');
jest.mock('fs/promises');
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

    const options: Options = { tabWidth: 7, trailingComma: 'es5' };
    (getPrettierOptions as jest.Mock).mockResolvedValue(options);
    (readFile as jest.Mock).mockResolvedValue('Read file');

    (getRecursiveFileList as jest.Mock).mockResolvedValue(paths);
    (getRenderingTasks as jest.Mock).mockImplementation((ctx) => ({
      ...ctx,
    }));

    const expectedTasks = [
      {
        title: './folder/file.md',
        task: {
          path: './folder/file.md.html',
          contents: 'Read file',
          preprocessFn: parseMarkdownIntoDocument,
          prettierOptions: {
            tabWidth: 7,
            trailingComma: 'es5',
            parser: 'html',
          },
        },
      },
      {
        title: './lessons/summary.md',
        task: {
          path: './lessons/summary.md.html',
          contents: 'Read file',
          preprocessFn: parseMarkdownIntoDocument,
          prettierOptions: {
            tabWidth: 7,
            trailingComma: 'es5',
            parser: 'html',
          },
        },
      },
      {
        title: './test.md',
        task: {
          path: './test.md.html',
          contents: 'Read file',
          preprocessFn: parseMarkdownIntoDocument,
          prettierOptions: {
            tabWidth: 7,
            trailingComma: 'es5',
            parser: 'html',
          },
        },
      },
      {
        title: './do/not/enter/secret.md',
        task: {
          path: './do/not/enter/secret.md.html',
          contents: 'Read file',
          preprocessFn: parseMarkdownIntoDocument,
          prettierOptions: {
            tabWidth: 7,
            trailingComma: 'es5',
            parser: 'html',
          },
        },
      },
    ];

    const task = getMarkdownRenderingTasks('./myfolder');
    await task(null, providedTask as ListrTaskWrapper<any, any>);

    expect(lister).toHaveBeenCalledWith(expectedTasks, expect.anything());
    expect(getRecursiveFileList).toHaveBeenCalledWith('./myfolder');
  });
});
