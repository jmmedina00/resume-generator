import { ListrTaskWrapper } from 'listr2';
import { RenderContext } from '../context';
import { validateContextContents } from './validate';
import { prettifyContentsofContext } from './pretty';
import { writeContextToFile } from './io';

export const getFileDescriptorRenderingTasks =
  (renderCtx: RenderContext) => (_: any, task: ListrTaskWrapper<any, any>) =>
    task.newListr<RenderContext>(
      [
        { title: 'Validate input', task: validateContextContents },
        { title: 'Prettify input', task: prettifyContentsofContext },
        {
          title: 'Write to file',
          task: writeContextToFile,
        },
      ],
      { ctx: renderCtx, concurrent: false }
    );
