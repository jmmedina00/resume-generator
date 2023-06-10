import type { ListrTask, ListrTaskWrapper } from 'listr2';
import type { RenderContext } from '../context';
import { getFullTaskName } from '../io/task';
import { prettifyContentsofContext } from './util/pretty';
import { writeContextToFile } from './util';

const TASK_PREPROCESS = 'Preprocess input';
const TASK_PRETTY = 'Prettify input';
const TASK_WRITE = 'Write to file';

export type TaskYielder = (
  task: ListrTaskWrapper<any, any>
) => ListrTask<RenderContext, any>[];

export const getRenderingTasks =
  (renderCtx: RenderContext) => (_: any, task: ListrTaskWrapper<any, any>) =>
    task.newListr<RenderContext>(
      [
        {
          title: getFullTaskName(TASK_PREPROCESS, task),
          task: renderCtx.preprocessFn,
        },
        {
          title: getFullTaskName(TASK_PRETTY, task),
          task: prettifyContentsofContext,
          enabled: (ctx) => !!ctx.prettierOptions,
        },
        {
          title: getFullTaskName(TASK_WRITE, task),
          task: writeContextToFile,
        },
      ],
      { ctx: renderCtx, concurrent: false }
    );

export const render =
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
