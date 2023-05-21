import { Listr, ListrTaskWrapper } from 'listr2';
import { ResumeContext } from '../context';
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
import { FileDescriptor } from '../describe';
import {
  getResumeToDocumentConverter,
  getResumeToPdfConverter,
} from './export/convert';
import { readFile } from 'node:fs/promises';
import { Options } from 'prettier';

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
  const THEME_HTML = 'even';
  const THEME_PDF = 'spartacus';

  const namer = ({ name, subversion }: FileDescriptor) =>
    `version: ${name}` + (!subversion ? '' : `, sub: ${subversion}`);
  const keywordedNamer = (keyword: string) => (descriptor: FileDescriptor) =>
    [keyword, namer(descriptor)].join(' - ');

  const publicDescriptors = getPublicVersionDescriptors(ctx);
  const privateDescriptors = getPrivateVersionDescriptors(ctx);

  const prettierOptions = await getPrettierOptions();
  const htmlOptions = { ...prettierOptions, parser: 'html' };

  const navbarTemplate = await readFile('./assets/navbar.html', 'utf-8');
  const navbarStyles = await readFile('./assets/styles.css', 'utf-8');

  const jsonRender = {
    prettierOptions,
    preprocessFn: async () => {},
  };

  const docRender = {
    templateContents: navbarTemplate,
    templateStyles: navbarStyles,
    prettierOptions: htmlOptions,
    preprocessFn: getResumeToDocumentConverter(THEME_HTML, ctx),
  };

  const pdfRender = {
    prettierOptions: null as unknown as Options,
    preprocessFn: getResumeToPdfConverter(THEME_PDF),
  };

  const publicTasks = publicDescriptors.map((descriptor) => ({
    title: keywordedNamer('PUBLIC')(descriptor),
    task: getExportTasksFromDescriptor(
      descriptor,
      { json: jsonRender, html: docRender, pdf: pdfRender },
      validateResumeWithSchema
    ),
  }));

  const privateTasks = privateDescriptors.map((descriptor) => ({
    title: keywordedNamer('PRIVATE')(descriptor),
    task: getExportTasksFromDescriptor(
      descriptor,
      { json: jsonRender, pdf: pdfRender },
      validateResumeWithSchema
    ),
  }));

  return task.newListr([...publicTasks, ...privateTasks], { concurrent: true });
};
