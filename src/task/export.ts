import { Listr, ListrTaskWrapper } from 'listr2';
import { RenderContext, ResumeContext } from './context';
import { getRenderingTasks } from './render';
import { FileDescriptor, getDescribedPath } from './describe';

export const PUBLIC_DIST = './public';
export const PRIVATE_DIST = './private';

export const getExportTasksFromDescriptor =
  (
    descriptor: FileDescriptor,
    {
      prettierOptions = {},
      preprocessFn = async () => {},
    }: Partial<RenderContext>
  ) =>
  (
    ctx: ResumeContext,
    task: ListrTaskWrapper<ResumeContext, any>
  ): Listr<RenderContext> => {
    const { contents } = descriptor;

    const context: RenderContext = {
      path: getDescribedPath(descriptor, 'json'),
      contents,
      prettierOptions,
      preprocessFn,
    };

    return getRenderingTasks(context)(ctx, task);
  };
