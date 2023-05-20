import { ListrTaskWrapper } from 'listr2';
import { RenderContext } from '../context';
import { prettifyContentsofContext } from './pretty';
import { writeContextToFile } from './io';

export const getRenderingTasks =
  (renderCtx: RenderContext) => (_: any, task: ListrTaskWrapper<any, any>) =>
    task.newListr<RenderContext>(
      [
        { title: 'Preprocess input', task: renderCtx.preprocessFn },
        {
          title: 'Prettify input',
          task: prettifyContentsofContext,
          enabled: (ctx) => !!ctx.prettierOptions,
        },
        {
          title: 'Write to file',
          task: writeContextToFile,
        },
      ],
      { ctx: renderCtx, concurrent: false }
    );
