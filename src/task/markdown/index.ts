import type { ListrTaskWrapper } from 'listr2';
import { getRecursiveFileList } from '../../util/io';
import { extname } from 'path';
import { getRenderingTasks } from '../render';
import { getFullTaskName } from '../io/task';
import { getYielders } from './yielder';

export const getMarkdownRenderingTasks =
  (path: string) => async (_: any, task: ListrTaskWrapper<any, any>) => {
    const files = await getRecursiveFileList(path);

    const tasks = files
      .filter((file) => extname(file) === '.md')
      .map(async (file) => {
        const desiredPath = file + '.html';

        return {
          title: getFullTaskName(file, task),
          task: getRenderingTasks(desiredPath, 'fromfile', getYielders(file)),
        };
      });

    return task.newListr(await Promise.all(tasks), { concurrent: true });
  };
