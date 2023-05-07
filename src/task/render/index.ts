import { ListrTaskWrapper } from 'listr2';
import { RenderContext } from '../context';
import { validateContextContents } from './validate';
import { prettifyContentsofContext } from './pretty';
import { writeToFile } from '../io/write';

export const getFileDescriptorRenderingTasks =
  (renderCtx: RenderContext) => (_: any, task: ListrTaskWrapper<any, any>) =>
    task.newListr<RenderContext>(
      [
        { title: 'Validate input', task: validateContextContents },
        { title: 'Prettify input', task: prettifyContentsofContext },
        {
          title: 'Write to file',
          task: (ctx) => writeToFile(ctx.path, ({ contents }) => contents),
        },
      ],
      { ctx: renderCtx, concurrent: false }
    );
