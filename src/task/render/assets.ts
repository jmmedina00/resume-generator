import type { RenderContext } from '../context';
import { getFullTaskName } from '../io/task';
import { readLocalFile } from '../io/read';
import { setIntoContext } from './util';
import type { TaskYielder } from '.';
import { ListrTaskWrapper } from 'listr2';

export interface AssetsDeclaration {
  [key: string]: string;
}

export const getLocalAssetIntoContextTask = (
  key: string,
  path: string
): ((ctx: RenderContext) => Promise<void>) =>
  readLocalFile(setIntoContext(key), path);

export const getLocalAssetGatheringYielder =
  (declaration: AssetsDeclaration): TaskYielder =>
  (task) =>
    [
      {
        title: getFullTaskName('Gather assets', task),
        task: (
          ctx: RenderContext,
          subtask: ListrTaskWrapper<RenderContext, any>
        ) =>
          subtask.newListr(
            Object.entries(declaration).map(([key, path]) => ({
              title: getFullTaskName(path, subtask),
              task: getLocalAssetIntoContextTask(key, path),
            })),
            {
              concurrent: true,
              ctx,
            }
          ),
      },
    ];
