import type { RenderContext } from '../context';
import { getFullTaskName } from '../io/task';
import { readLocalFile } from '../io/read';
import { setIntoContext } from './util';
import type { TaskYielder } from '.';

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
  (task) => {
    return Object.entries(declaration).map(([key, path]) => ({
      title: getFullTaskName(path, task),
      task: getLocalAssetIntoContextTask(key, path),
    }));
  };
