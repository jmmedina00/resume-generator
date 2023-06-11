import type { ListrTask, ListrTaskWrapper } from 'listr2';
import type { RenderContext } from '../context';
import { getFullTaskName } from '../io/task';
import { writeContextToFile } from './util';

const TASK_WRITE = 'Write to file';

export type TaskYielder = (
  task: ListrTaskWrapper<any, any>
) => ListrTask<RenderContext, any>[];

export const getRenderingTasks =
  (path: string, src: string, yielders: TaskYielder[]) =>
  <T>(_: any, task: ListrTaskWrapper<T, any>) =>
    task.newListr<RenderContext>(
      [
        ...yielders.flatMap((yielder) => yielder(task)),
        {
          title: getFullTaskName(TASK_WRITE, task),
          task: writeContextToFile,
        },
      ],
      {
        ctx: {
          path,
          resources: { src },
          contents: Buffer.of(),
          preprocessFn: () => '',
          prettierOptions: {},
        },
        concurrent: false,
      }
    );
