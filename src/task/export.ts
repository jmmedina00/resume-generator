import { Listr, ListrTaskWrapper } from 'listr2';
import { ResumeContext } from './context';
import { format } from 'path';
import { writeToFile } from './io/write';

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

export const getExportTasksFromDescriptors =
  (descriptors: FileDescriptor[]) =>
  (
    ctx: ResumeContext,
    task: ListrTaskWrapper<ResumeContext, any>
  ): Listr<ResumeContext> =>
    task.newListr(
      descriptors.map(({ path, fn }) => ({
        title: `Save ${path}`,
        task: writeToFile(path, fn),
      })),
      { concurrent: true }
    );
