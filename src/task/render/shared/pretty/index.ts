import type { TaskYielder } from '../..';
import { getFullTaskName } from '../../../io/task';
import { makeResourceFromExistingWithFn } from '../../transform';
import { appendToObjectResource } from '../../util';
import { adaptPrettierFormat } from './transform';

export const KEY_PRETTIER_OPTIONS = 'prettierOptions';
export const KEY_PRETTIFIED = 'pretty';

export const addParserWithPrettyOptions =
  (parser: string): TaskYielder =>
  (task) =>
    [
      {
        title: getFullTaskName(
          `Add ${parser} parser to Prettier options`,
          task
        ),
        task: appendToObjectResource(KEY_PRETTIER_OPTIONS, { parser }),
      },
    ];

export const prettifyResource =
  (srcKey: string): TaskYielder =>
  (task) =>
    [
      {
        title: getFullTaskName(`Prettify resource ${srcKey}`, task),
        task: makeResourceFromExistingWithFn(
          [srcKey, KEY_PRETTIER_OPTIONS],
          KEY_PRETTIFIED,
          adaptPrettierFormat
        ),
      },
    ];
