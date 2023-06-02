import { Listr, ListrTaskWrapper } from 'listr2';
import {
  RenderContext,
  RenderWithTemplateContext,
  ResumeContext,
} from './context';
import { getRenderingTasks } from './render';
import { FileDescriptor, getDescribedPath } from './describe';
import { Options } from 'prettier';
import { getFullTaskName } from './io/task';

export const PUBLIC_DIST = './public';
export const PRIVATE_DIST = './private';

export const TASK_VALIDATE = 'Validate input';
export const TASK_EXPORT = 'Export to formats';

export interface RenderContextTemplates {
  [format: string]: {
    templateContents?: string;
    templateStyles?: string;
    prettierOptions: Options;
    preprocessFn: (ctx: any) => Promise<any>;
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
    const { contents: contentString } = descriptor;
    const contents = Buffer.from(contentString);

    const exportTasks = Object.entries(templates).map(
      ([format, partialContext]) => {
        const context: RenderWithTemplateContext = {
          ...partialContext,
          activePage: descriptor.name,
          contents,
          path: getDescribedPath(descriptor, format),
        };
        return {
          title: getFullTaskName(format, task),
          task: getRenderingTasks(context),
        };
      }
    );

    return task.newListr<RenderContext>(
      [
        {
          title: getFullTaskName(TASK_VALIDATE, task),
          task: validateFn,
        },
        {
          title: getFullTaskName(TASK_EXPORT, task),
          task: (_, task) => task.newListr(exportTasks),
        },
      ],
      { ctx: { contents } as RenderContext } // Only needed for initial validation
    );
  };
