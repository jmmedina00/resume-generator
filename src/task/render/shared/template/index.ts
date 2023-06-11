import { getFullTaskName } from '../../../io/task';
import type { TaskYielder } from '../..';
import { makeResourceFromExistingWithFn } from '../../transform';
import { HelperFunctions, applyMustacheTemplateToResource } from './transform';

interface ApplyTemplateKeys {
  template: string;
  json: string;
  target: string;
}

export const applyTemplateToObjectResource =
  (
    { template, json, target }: ApplyTemplateKeys,
    funcs: HelperFunctions
  ): TaskYielder =>
  (task) =>
    [
      {
        title: getFullTaskName(
          `Apply template ${template} with object ${json} to target ${target}`,
          task
        ),
        task: makeResourceFromExistingWithFn(
          [template, json],
          target,
          applyMustacheTemplateToResource(funcs)
        ),
      },
    ];
