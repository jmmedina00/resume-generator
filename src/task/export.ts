import { Listr, ListrTaskWrapper } from 'listr2';
import { RenderContext, ResumeContext } from './context';
import { getRenderingTasks } from './render';
import { FileDescriptor, getDescribedPath } from './describe';
import { Options } from 'prettier';

export const PUBLIC_DIST = './public';
export const PRIVATE_DIST = './private';

export const TASK_VALIDATE = 'Validate input';
export const TASK_EXPORT = 'Export to formats';

export interface RenderContextTemplates {
  [format: string]: {
    prettierOptions: Options;
    preprocessFn: (ctx: RenderContext) => Promise<any>;
  };
}

export const getExportTasksFromDescriptor =
  (
    descriptor: FileDescriptor,
    templates: RenderContextTemplates,
    validateFn: (ctx: RenderContext) => Promise<void>
  ) =>
  (
    _: ResumeContext,
    task: ListrTaskWrapper<ResumeContext, any>
  ): Listr<RenderContext> => {
    const { contents } = descriptor;

    const exportTasks = Object.entries(templates).map(
      ([format, partialContext]) => {
        const context: RenderContext = {
          ...partialContext,
          contents,
          path: getDescribedPath(descriptor, format),
        };
        return { title: format, task: getRenderingTasks(context) };
      }
    );

    return task.newListr<RenderContext>(
      [
        {
          title: TASK_VALIDATE,
          task: validateFn,
        },
        {
          title: TASK_EXPORT,
          task: (_, task) => task.newListr(exportTasks),
        },
      ],
      { ctx: { contents } as RenderContext } // Only needed for initial validation
    );
  };
