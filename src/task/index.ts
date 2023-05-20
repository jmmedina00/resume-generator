import { Listr } from 'listr2';
import { ResumeContext } from './context';
import { readGitHub, readPrivateIterations, readSourceResume } from './io/read';
import { generatePrivateVersions } from './resume/private';
import {
  getExportTasksForAllResumeVersions,
  getPublicResumeCreationTasks,
} from './resume';
import { deleteFolder } from './io/write';

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
  ],
  { collectErrors: 'minimal', rendererOptions: { collapseSubtasks: false } }
);
