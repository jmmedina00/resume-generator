import type { ResumeContext } from '../../../../context';
import { getFullTaskName } from '../../../../io/task';
import type { TaskYielder } from '../../../../render';
import { makeResourceFromExistingWithFn } from '../../../../render/transform';
import { getNavbarGenerator } from './transform';

export const KEY_NAVBAR_TEMPLATE = 'navbarTemplate';
export const KEY_NAVBAR = 'navbar';

export const getNavbarYielder =
  ({ localised }: ResumeContext, activeLang: string): TaskYielder =>
  (task) =>
    [
      {
        title: getFullTaskName('Get navbar', task),
        task: makeResourceFromExistingWithFn(
          [KEY_NAVBAR_TEMPLATE],
          KEY_NAVBAR,
          getNavbarGenerator(localised, activeLang)
        ),
      },
    ];
