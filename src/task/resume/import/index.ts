import { ListrTaskWrapper } from 'listr2';
import { ResumeContext } from '../../context';
import { deleteFolder } from '../../io/write';
import { clearDriveFolder } from '../../io/upload';
import { isThisCI } from '../..';
import { readGitHub, readPrivateFile, readSourceResume } from '../../io/read';
import {
  addResumePartsToTheirCorrectPlaces,
  parsePrivateIterations,
  setGitHubUserInfo,
} from './processor';
import { basename } from 'path';

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
        task: readSourceResume(addResumePartsToTheirCorrectPlaces),
      },
      { title: 'Read private', task: readPrivateFile(parsePrivateIterations) },
    ],
    {
      concurrent: true,
    }
  );
