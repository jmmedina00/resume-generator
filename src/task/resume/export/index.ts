import type { Listr, ListrTask, ListrTaskWrapper } from 'listr2';
import type { ResumeContext } from '../../context';
import { FileDescriptor, getDescribedPath } from '../../describe';
import {
  getFocusedVersionDescriptors,
  getPrivateVersionDescriptors,
  getPublicVersionDescriptors,
} from './descriptor';
import { htmlYielders, jsonYielders, mdYielders, pdfYielders } from './config';
import { getFullTaskName } from '../../io/task';
import { basename } from 'path';
import { TaskYielder, getRenderingTasks } from '../../render';

interface NameProvider {
  keyword: string;
  namer: (descriptor: FileDescriptor) => string;
}

const focusedNamer = ({ dir }: FileDescriptor) => `version: ${basename(dir)}`;

const namer = ({ name, subversion }: FileDescriptor) =>
  `version: ${name}` + (!subversion ? '' : `, sub: ${subversion}`);

const newKeywordedNamer =
  ({ keyword, namer }: NameProvider) =>
  (descriptor: FileDescriptor, format: string) =>
    [keyword, namer(descriptor), format].join(' - ');

const generateTasks =
  (
    nameProvider: NameProvider,
    yielderCollections: { [key: string]: TaskYielder[] },
    task: ListrTaskWrapper<ResumeContext, any>
  ) =>
  (descriptor: FileDescriptor): ListrTask<any, any>[] =>
    Object.entries(yielderCollections).map(([format, yielders]) => ({
      title: getFullTaskName(
        newKeywordedNamer(nameProvider)(descriptor, format),
        task
      ),
      task: getRenderingTasks(
        getDescribedPath(descriptor, format),
        descriptor.contents,
        yielders
      ),
    }));

export const getExportTasksForAllResumeVersions = async (
  ctx: ResumeContext,
  task: ListrTaskWrapper<ResumeContext, any>
): Promise<Listr<ResumeContext>> => {
  const publicDescriptors = getPublicVersionDescriptors(ctx);
  const focusedDescriptors = getFocusedVersionDescriptors(ctx);
  const privateDescriptors = getPrivateVersionDescriptors(ctx);

  const json = jsonYielders();
  const md = mdYielders();
  const pdf = pdfYielders();

  const publicTasks = publicDescriptors.flatMap((descriptor) =>
    generateTasks(
      { keyword: 'PUBLIC', namer },
      { json, md, pdf, html: htmlYielders(ctx, descriptor.name) }, // Navbar parameter is quite overloading...
      task
    )(descriptor)
  );

  const focusedTasks = focusedDescriptors.flatMap(
    generateTasks(
      { keyword: 'FOCUSED', namer: focusedNamer },
      { json, md },
      task
    )
  );

  const privateTasks = privateDescriptors.flatMap(
    generateTasks({ keyword: 'PRIVATE', namer }, { json, pdf }, task)
  );

  return task.newListr([...publicTasks, ...focusedTasks, ...privateTasks], {
    concurrent: true,
  });
};
