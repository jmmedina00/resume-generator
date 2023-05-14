import { Listr, ListrTaskWrapper } from 'listr2';
import { RenderContext, ResumeContext } from '../context';
import { getExportTasksFromDescriptor } from '../export';
import { getPrettierOptions, validateResumeWithSchema } from './export/config';
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
import {
  getPrivateVersionDescriptors,
  getPublicVersionDescriptors,
} from './export/descriptor';

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

export const getExportTasksForAllResumeVersions = async (
  ctx: ResumeContext,
  task: ListrTaskWrapper<ResumeContext, any>
): Promise<Listr<ResumeContext>> => {
  const descriptors = [
    ...getPublicVersionDescriptors(ctx),
    ...getPrivateVersionDescriptors(ctx),
  ];

  const prettierOptions = await getPrettierOptions();
  const partialRenderContext: Partial<RenderContext> = {
    prettierOptions,
    preprocessFn: validateResumeWithSchema,
  };

  const tasks = descriptors.map((descriptor) => ({
    title: [descriptor.name, descriptor.subversion]
      .filter((foo) => !!foo)
      .join('-'),
    task: getExportTasksFromDescriptor(descriptor, partialRenderContext),
  }));

  return task.newListr(tasks);
};
