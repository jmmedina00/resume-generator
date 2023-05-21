import { Listr, ListrTaskWrapper } from 'listr2';
import { ResumeContext } from '../../context';
import { FileDescriptor } from '../../describe';
import {
  getPrivateVersionDescriptors,
  getPublicVersionDescriptors,
} from './descriptor';
import { getPrettierOptions, validateResumeWithSchema } from './config';
import { readFile } from 'fs/promises';
import {
  getResumeToDocumentConverter,
  getResumeToPdfConverter,
} from './convert';
import { Options } from 'prettier';
import { getExportTasksFromDescriptor } from '../../export';

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
