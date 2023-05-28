import { Listr } from 'listr2';
import { ResumeContext } from './context';
import { generatePrivateVersions } from './resume/private';
import { getPublicResumeCreationTasks } from './resume';
import { copyFileToFolder } from './io/write';
import { getExportTasksForAllResumeVersions } from './resume/export';
import { uploadFolderToDrive } from './io/upload';
import { getResumeLoadingTasks } from './resume/import';
import { getMarkdownRenderingTasks } from './markdown';

export const isThisCI = () => !!process.env['CI'];

export const tasks = new Listr<ResumeContext>(
  [
    {
      title: 'Initialize state',
      task: getResumeLoadingTasks,
    },
    {
      title: 'Produce public resume versions',
      task: getPublicResumeCreationTasks,
    },
    {
      title: 'Produce private versions',
      task: generatePrivateVersions,
    },
    {
      title: 'Export resume versions',
      task: getExportTasksForAllResumeVersions,
    },
    {
      title: 'Add index to public folder',
      task: copyFileToFolder('./assets/index.html', './public'),
    },
    {
      title: 'Make web versions of Markdown files',
      task: getMarkdownRenderingTasks('./public'),
    },
    {
      title: 'Upload entire private folder to Drive',
      task: (_, task) =>
        task.newListr(uploadFolderToDrive('./private'), { concurrent: true }),
      enabled: isThisCI,
    },
  ],
  {
    collectErrors: 'minimal',
    rendererOptions: { collapseSubtasks: false },
    fallbackRendererCondition: isThisCI,
  }
);
