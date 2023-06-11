import type { TaskYielder } from '../../../render';
import { getFullTaskName } from '../../../io/task';
import { makeResourceFromExistingWithFn } from '../../../render/transform';

export interface ResourceApplier {
  title: string;
  sourceKeys: string[];
  targetKey: string;
  syncFn: (...foo: string[]) => string;
}

const turnIntoAsync =
  (func: (...foo: string[]) => string) =>
  async (...data: string[]) =>
    func(...data);

export const makeResourceApplier =
  ({ title, sourceKeys, targetKey, syncFn }: ResourceApplier): TaskYielder =>
  (task) =>
    [
      {
        title: getFullTaskName(title, task),
        task: makeResourceFromExistingWithFn(
          sourceKeys,
          targetKey,
          turnIntoAsync(syncFn)
        ),
      },
    ];
