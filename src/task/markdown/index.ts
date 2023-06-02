import { ListrTaskWrapper } from 'listr2';
import { parseMarkdownIntoDocument } from './render';
import { getRecursiveFileList } from '../../util/io';
import { extname } from 'path';
import { RenderContext } from '../context';
import { Options } from 'prettier';
import { getPrettierOptions } from '../resume/export/config';
import { getRenderingTasks } from '../render';
import { readFile } from 'fs/promises';
import { getFullTaskName } from '../io/task';

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
        title: getFullTaskName(file, task),
        task: getRenderingTasks(await getRenderContext(file, prettierOptions)),
      }));

    return task.newListr(await Promise.all(tasks), { concurrent: true });
  };
