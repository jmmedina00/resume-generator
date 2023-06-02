import { ListrTaskWrapper } from 'listr2';
import { ResumeContext } from '../../context';
import { deleteFolder } from '../../io/write';
import { clearDriveFolder } from '../../io/upload';
import { isThisCI } from '../..';
import { readGitHub, readPrivateFile, readLocalFile } from '../../io/read';
import {
  addResumePartsToTheirCorrectPlaces,
  parsePrivateIterations,
  setGitHubUserInfo,
} from './processor';
import { basename } from 'path';
import { getFullTaskName } from '../../io/task';

export const SRC_RESUME_PATH = './resume.yml';

const folderDeleteTitle = (path: string) =>
  `Delete ${basename(path)} folder (if any)`;

const getFolderDeletionTask = (
  path: string,
  task: ListrTaskWrapper<ResumeContext, any>
) => ({
  title: getFullTaskName(folderDeleteTitle(path), task),
  task: deleteFolder(path),
});

export const getResumeLoadingTasks = (
  _: ResumeContext,
  task: ListrTaskWrapper<ResumeContext, any>
) =>
  task.newListr(
    [
      getFolderDeletionTask('./private', task),
      getFolderDeletionTask('./public', task),
      {
        title: getFullTaskName('Clear Drive folder', task),
        task: clearDriveFolder,
        enabled: isThisCI,
      },
      {
        title: getFullTaskName('Read GitHub', task),
        task: readGitHub(setGitHubUserInfo),
      },
      {
        title: getFullTaskName('Read source resume', task),
        task: readLocalFile(
          addResumePartsToTheirCorrectPlaces,
          SRC_RESUME_PATH
        ),
      },
      {
        title: getFullTaskName('Read private', task),
        task: readPrivateFile(parsePrivateIterations),
      },
    ],
    {
      concurrent: true,
    }
  );
