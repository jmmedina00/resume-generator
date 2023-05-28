import { ListrTaskWrapper } from 'listr2';
import { parseMarkdownIntoDocument } from './render';
import { getRecursiveFileList } from '../../util/io';
import { extname } from 'path';
import { RenderContext } from '../context';
import { Options } from 'prettier';
import { getPrettierOptions } from '../resume/export/config';
import { getRenderingTasks } from '../render';
import { readFile } from 'fs/promises';

const getRenderContext = async (
  path: string,
  prettierOptions: Options
): Promise<RenderContext> => ({
  path: path + '.html',
  contents: await readFile(path), // Testing crashes if using fs
  preprocessFn: parseMarkdownIntoDocument,
  prettierOptions: { ...prettierOptions, parser: 'html' },
});

export const getMarkdownRenderingTasks =
  (path: string) => async (_: any, task: ListrTaskWrapper<any, any>) => {
    const files = await getRecursiveFileList(path);
    const prettierOptions = await getPrettierOptions();

    const tasks = files
      .filter((file) => extname(file) === '.md')
      .map(async (file) => ({
        title: file,
        task: getRenderingTasks(await getRenderContext(file, prettierOptions)),
      }));

    return task.newListr(await Promise.all(tasks), { concurrent: true });
  };
