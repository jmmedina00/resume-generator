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
} from '../../resume/gen-public';

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
      title: TASK_COMPLETE_BASICS,
      task: transformIncompleteField('basics', addGitHubInfoToBasics),
    },
    {
      title: TASK_COMPLETE_PROJECTS,
      task: transformIncompleteField('projects', getProperProjects),
    },
    {
      title: TASK_LOCALES,
      task: transformCompleteToLocalised,
    },
    {
      title: TASK_TRANSLATE,
      task: transformLocalisedToTranslated,
    },
    {
      title: TASK_DEKEY_WORK,
      task: transformAndReplaceLocalisedField('work', ['position', 'summary']),
    },
    {
      title: TASK_DEKEY_EDUCATION,
      task: transformAndReplaceLocalisedField('education', [
        'area',
        'studyType',
      ]),
    },
  ]);
