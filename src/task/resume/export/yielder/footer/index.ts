import { getFullTaskName } from '../../../../io/task';
import type { TaskYielder } from '../../../../render';
import { applyTemplateToObjectResource } from '../../../../render/shared';
import { getRepoLink } from './transform';

export const KEY_REPO_LINK = 'repoLink';
export const KEY_FOOTER_TEMPLATE = 'footerTemplate';
export const KEY_FOOTER = 'footer';

const keys = {
  template: KEY_FOOTER_TEMPLATE,
  json: KEY_REPO_LINK,
  target: KEY_FOOTER,
};

const getFooter: TaskYielder = (task) => [
  {
    title: getFullTaskName('Get repo link', task),
    task: getRepoLink(KEY_REPO_LINK),
  },
];

export const getFooterYielders = (): TaskYielder[] => [
  getFooter,
  applyTemplateToObjectResource(keys, {}),
];
