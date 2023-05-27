import { Listr } from 'listr2';
import { ResumeContext } from './context';
import { readGitHub, readPrivateIterations, readSourceResume } from './io/read';
import { generatePrivateVersions } from './resume/private';
import { getPublicResumeCreationTasks } from './resume';
import { copyFileToFolder, deleteFolder } from './io/write';
import { getExportTasksForAllResumeVersions } from './resume/export';
import { clearDriveFolder, uploadFolderToDrive } from './io/upload';

export const isThisCI = () => !!process.env['CI'];

export const tasks = new Listr<ResumeContext>(
  [
    {
      title: 'Initialize state',
      task: (_, task) =>
        task.newListr(
          [
            {
              title: 'Delete private folder (if any)',
              task: deleteFolder('./private'),
            },
            {
              title: 'Delete private folder (if any)',
              task: deleteFolder('./public'),
            },
            {
              title: 'Clear Drive folder',
              task: clearDriveFolder,
              enabled: isThisCI,
            },
            { title: 'Read GitHub', task: readGitHub },
            { title: 'Read source resume', task: readSourceResume },
            { title: 'Read private', task: readPrivateIterations },
          ],
          {
            concurrent: true,
          }
        ),
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
