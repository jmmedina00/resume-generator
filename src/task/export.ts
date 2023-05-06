import { Listr, ListrTaskWrapper } from 'listr2';
import { ResumeContext } from './context';
import { format } from 'path';
import { writeToFile } from './io/write';

export const PUBLIC_DIST = './public';
export const PRIVATE_DIST = './private';

export const exportPublicVersions = (
  ctx: ResumeContext,
  task: ListrTaskWrapper<ResumeContext, any>
): Listr<ResumeContext> => {
  const publicVersions = Object.keys(ctx.publicVersions);

  const writer = (version: string) => {
    const filename = `${version}.json`;
    const path = format({ base: filename, dir: PUBLIC_DIST });
    const fn = ({ publicVersions }: ResumeContext) =>
      JSON.stringify(publicVersions[version]);

    return {
      title: `Save ${filename}`,
      task: writeToFile(path, fn),
    };
  };

  return task.newListr(publicVersions.map(writer));
};

export const exportPrivateVersions = (
  ctx: ResumeContext,
  task: ListrTaskWrapper<ResumeContext, any>
): Listr<ResumeContext> => {
  const privateVersions = Object.keys(ctx.privateVersions).flatMap((code) =>
    ctx.privateVersions[code].map((_, index) => ({ code, index }))
  );

  const tasks = privateVersions.map(({ code, index }) => {
    const filename = `${code}-${index}.json`;
    const path = format({ base: filename, dir: PRIVATE_DIST });
    const fn = ({ privateVersions }: ResumeContext) =>
      JSON.stringify(privateVersions[code][index]);

    return { title: `Save ${filename}`, task: writeToFile(path, fn) };
  });

  return task.newListr(tasks);
};
