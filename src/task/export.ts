import { Listr, ListrTaskWrapper } from 'listr2';
import { RenderContext, ResumeContext } from './context';
import { format } from 'path';
import { getRenderingTasks } from './render';

export const PUBLIC_DIST = './public';
export const PRIVATE_DIST = './private';

export interface FileDescriptor {
  path: string;
  fn: (ctx: ResumeContext) => any;
}

export const getPublicVersionDescriptors = ({
  publicVersions,
}: ResumeContext): FileDescriptor[] =>
  Object.keys(publicVersions).map((version) => ({
    path: format({ base: `${version}.json`, dir: PUBLIC_DIST }),
    fn: (ctx) => JSON.stringify(ctx.publicVersions[version]),
  }));

export const getPrivateVersionDescriptors = ({
  privateVersions,
}: ResumeContext): FileDescriptor[] =>
  Object.keys(privateVersions)
    .flatMap((code) =>
      privateVersions[code].map((_, index) => ({ code, index }))
    )
    .map(({ code, index }) => ({
      path: format({ base: `${code}-${index}.json`, dir: PRIVATE_DIST }),
      fn: (ctx) => JSON.stringify(ctx.privateVersions[code][index]),
    }));

export const getExportTasksFromDescriptor =
  (
    { path, fn }: FileDescriptor,
    {
      prettierOptions = {},
      preprocessFn = async () => {},
    }: Partial<RenderContext>
  ) =>
  (
    ctx: ResumeContext,
    task: ListrTaskWrapper<ResumeContext, any>
  ): Listr<RenderContext> => {
    const context: RenderContext = {
      path,
      contents: fn(ctx),
      prettierOptions,
      preprocessFn,
    };

    return getRenderingTasks(context)(ctx, task);
  };
