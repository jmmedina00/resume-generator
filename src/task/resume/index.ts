import { Listr, ListrTaskWrapper } from 'listr2';
import { ResumeContext } from '../context';
import {
  transformAndReplaceLocalisedField,
  transformCompleteToLocalised,
  transformIncompleteField,
  transformLocalisedToTranslated,
} from './public';
import {
  addGitHubInfoToBasics,
  getProperProjects,
} from '../../resume/generation/public';
import { getFullTaskName } from '../io/task';

export const TASK_COMPLETE_BASICS = 'Complete basics';
export const TASK_COMPLETE_PROJECTS = 'Complete projects';
export const TASK_LOCALES = 'Generate locales';
export const TASK_TRANSLATE = 'Generate translations';
export const TASK_DEKEY_WORK = 'Dekey work after the fact';
export const TASK_DEKEY_EDUCATION = 'Dekey education after the fact';

export const getPublicResumeCreationTasks = (
  _: ResumeContext,
  task: ListrTaskWrapper<ResumeContext, any>
): Listr<ResumeContext> =>
  task.newListr([
    {
      title: getFullTaskName(TASK_COMPLETE_BASICS, task),
      task: transformIncompleteField('basics', addGitHubInfoToBasics),
    },
    {
      title: getFullTaskName(TASK_COMPLETE_PROJECTS, task),
      task: transformIncompleteField('projects', getProperProjects),
    },
    {
      title: getFullTaskName(TASK_LOCALES, task),
      task: transformCompleteToLocalised,
    },
    {
      title: getFullTaskName(TASK_TRANSLATE, task),
      task: transformLocalisedToTranslated,
    },
    {
      title: getFullTaskName(TASK_DEKEY_WORK, task),
      task: transformAndReplaceLocalisedField('work', ['position', 'summary']),
    },
    {
      title: getFullTaskName(TASK_DEKEY_EDUCATION, task),
      task: transformAndReplaceLocalisedField('education', [
        'area',
        'studyType',
      ]),
    },
  ]);
