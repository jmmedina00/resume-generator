import { Listr, ListrTask, ListrTaskWrapper } from 'listr2';
import { ResumeContext } from '../../context';
import { FileDescriptor } from '../../describe';
import {
  getFocusedVersionDescriptors,
  getPrivateVersionDescriptors,
  getPublicVersionDescriptors,
} from './descriptor';
import {
  getHtmlRender,
  getJsonRender,
  getMarkdownRender,
  getPdfRender,
  getPrettierOptions,
  validateResumeWithSchema,
} from './config';
import {
  RenderContextTemplates,
  getExportTasksFromDescriptor,
} from '../../export';
import { getFullTaskName } from '../../io/task';
import { basename } from 'path';

interface NameProvider {
  keyword: string;
  namer: (descriptor: FileDescriptor) => string;
}

const focusedNamer = ({ dir }: FileDescriptor) => `version: ${basename(dir)}`;

const namer = ({ name, subversion }: FileDescriptor) =>
  `version: ${name}` + (!subversion ? '' : `, sub: ${subversion}`);

const keywordedNamer =
  ({ keyword, namer }: NameProvider) =>
  (descriptor: FileDescriptor) =>
    [keyword, namer(descriptor)].join(' - ');

const generateTasks =
  (
    keyword: NameProvider,
    templates: RenderContextTemplates,
    task: ListrTaskWrapper<ResumeContext, any>
  ) =>
  (descriptor: FileDescriptor): ListrTask<any, any> => ({
    title: getFullTaskName(keywordedNamer(keyword)(descriptor), task),
    task: getExportTasksFromDescriptor(
      descriptor,
      templates,
      validateResumeWithSchema
    ),
  });

export const getExportTasksForAllResumeVersions = async (
  ctx: ResumeContext,
  task: ListrTaskWrapper<ResumeContext, any>
): Promise<Listr<ResumeContext>> => {
  const publicDescriptors = getPublicVersionDescriptors(ctx);
  const focusedDescriptors = getFocusedVersionDescriptors(ctx);
  const privateDescriptors = getPrivateVersionDescriptors(ctx);
  const prettierOptions = await getPrettierOptions();

  const json = await getJsonRender(prettierOptions);
  const html = await getHtmlRender(prettierOptions, ctx);
  const md = await getMarkdownRender(prettierOptions);
  const pdf = await getPdfRender();

  const publicTasks = publicDescriptors.map(
    generateTasks({ keyword: 'PUBLIC', namer }, { json, html, md, pdf }, task)
  );

  const focusedTasks = focusedDescriptors.map(
    generateTasks(
      { keyword: 'FOCUSED', namer: focusedNamer },
      { json, md },
      task
    )
  );

  const privateTasks = privateDescriptors.map(
    generateTasks({ keyword: 'PRIVATE', namer }, { json, pdf }, task)
  );

  return task.newListr([...publicTasks, ...focusedTasks, ...privateTasks], {
    concurrent: true,
  });
};
