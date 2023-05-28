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

export const SRC_RESUME_PATH = './resume.yml';

const getFolderDeletionTask = (path: string) => ({
  title: `Delete ${basename(path)} folder (if any)`,
  task: deleteFolder(path),
});

export const getResumeLoadingTasks = (
  _: ResumeContext,
  task: ListrTaskWrapper<ResumeContext, any>
) =>
  task.newListr(
    [
      getFolderDeletionTask('./private'),
      getFolderDeletionTask('./public'),
      {
        title: 'Clear Drive folder',
        task: clearDriveFolder,
        enabled: isThisCI,
      },
      { title: 'Read GitHub', task: readGitHub(setGitHubUserInfo) },
      {
        title: 'Read source resume',
        task: readLocalFile(
          addResumePartsToTheirCorrectPlaces,
          SRC_RESUME_PATH
        ),
      },
      { title: 'Read private', task: readPrivateFile(parsePrivateIterations) },
    ],
    {
      concurrent: true,
    }
  );
