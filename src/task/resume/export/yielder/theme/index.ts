import { getFullTaskName } from '../../../../io/task';
import type { TaskYielder } from '../../../../render';
import { makeResourceFromExistingWithFn } from '../../../../render/transform';
import { transformWithTheme } from './transform';

export const KEY_WITH_THEME_APPLIED = 'themed';

export const applyJsonResumeThemeToResource =
  (srcKey: string, theme: string): TaskYielder =>
  (task) =>
    [
      {
        title: getFullTaskName(
          `Apply theme ${theme} to resource ${srcKey}`,
          task
        ),
        task: makeResourceFromExistingWithFn(
          [srcKey],
          KEY_WITH_THEME_APPLIED,
          transformWithTheme(theme)
        ),
      },
    ];
