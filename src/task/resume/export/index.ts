import { Listr, ListrTask, ListrTaskWrapper } from 'listr2';
import { ResumeContext } from '../../context';
import { FileDescriptor } from '../../describe';
import {
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

const namer = ({ name, subversion }: FileDescriptor) =>
  `version: ${name}` + (!subversion ? '' : `, sub: ${subversion}`);
const keywordedNamer = (keyword: string) => (descriptor: FileDescriptor) =>
  [keyword, namer(descriptor)].join(' - ');

const generateTasks =
  (keyword: string, templates: RenderContextTemplates) =>
  (descriptor: FileDescriptor): ListrTask<any, any> => ({
    title: keywordedNamer(keyword)(descriptor),
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
  const privateDescriptors = getPrivateVersionDescriptors(ctx);
  const prettierOptions = await getPrettierOptions();

  const json = await getJsonRender(prettierOptions);
  const html = await getHtmlRender(prettierOptions, ctx);
  const md = await getMarkdownRender(prettierOptions);
  const pdf = await getPdfRender();

  const publicTasks = publicDescriptors.map(
    generateTasks('PUBLIC', { json, html, md, pdf })
  );

  const privateTasks = privateDescriptors.map(
    generateTasks('PRIVATE', { json, pdf })
  );

  return task.newListr([...publicTasks, ...privateTasks], { concurrent: true });
};
