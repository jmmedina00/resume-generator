import { ListrTaskWrapper } from 'listr2';
import { RenderContext } from '../context';
import { prettifyContentsofContext } from './pretty';
import { writeContextToFile } from './io';
import { getFullTaskName } from '../io/task';

const TASK_PREPROCESS = 'Preprocess input';
const TASK_PRETTY = 'Prettify input';
const TASK_WRITE = 'Write to file';

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
