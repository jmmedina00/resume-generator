import type { ListrTaskWrapper } from 'listr2';
import type { ResumeContext } from '../../context';
import { checkVersionAgainstSchema } from './schema';
import { getFullTaskName } from '../../io/task';

export const validateAllResumesInContext = (
  ctx: ResumeContext,
  task: ListrTaskWrapper<any, any>
) => {
  const publicVersions = Object.entries(ctx.publicVersions).map(
    ([key, value]) => ['PUBLIC: ' + key, value]
  );

  const focusedVersions = Object.entries(ctx.focusedVersions).map(
    ([key, value]) => ['FOCUSED: ' + key, value]
  );

  const privateVersions = Object.entries(ctx.privateVersions).flatMap(
    ([key, list]) =>
      list.map((iteration, index) => [`PRIVATE: ${key}, ${index}`, iteration])
  );

  const tasks = [...publicVersions, ...focusedVersions, ...privateVersions].map(
    ([title, contents]) => ({
      title: getFullTaskName(title, task),
      task: checkVersionAgainstSchema(contents),
    })
  );

  return task.newListr(tasks, { concurrent: true });
};
