import { ListrTaskWrapper } from 'listr2';
import { isThisCI } from '../..';
import { readGitHub, readPrivateFile, readLocalFile } from '../../io/read';
import { clearDriveFolder } from '../../io/upload';
import { deleteFolder } from '../../io/write';
import {
  addResumePartsToTheirCorrectPlaces,
  parsePrivateIterations,
  setGitHubUserInfo,
} from './processor';
import { ResumeContext, initialContext } from '../../context';
import { SRC_RESUME_PATH, getResumeLoadingTasks } from '.';

jest.mock('../../io/write');
jest.mock('../../io/read');

describe('Resume importing tasks', () => {
  it('should provided all tasks according to resume needs', () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };
    const context: ResumeContext = { ...initialContext };

    (deleteFolder as jest.Mock).mockImplementation((folder) => ({
      folder,
      do: 'delete',
    }));

    (readGitHub as jest.Mock).mockImplementation((process) => ({
      process,
      do: 'github',
    }));

    (readLocalFile as jest.Mock).mockImplementation((process, path) => ({
      process,
      path,
      do: 'source',
    }));

    (readPrivateFile as jest.Mock).mockImplementation((process) => ({
      process,
      do: 'private',
    }));

    const expectedTasks = [
      {
        title: 'Delete private folder (if any)',
        task: { folder: './private', do: 'delete' },
      },
      {
        title: 'Delete public folder (if any)',
        task: { folder: './public', do: 'delete' },
      },
      {
        title: 'Clear Drive folder',
        task: clearDriveFolder,
        enabled: isThisCI,
      },
      {
        title: 'Read GitHub',
        task: { process: setGitHubUserInfo, do: 'github' },
      },
      {
        title: 'Read source resume',
        task: {
          process: addResumePartsToTheirCorrectPlaces,
          do: 'source',
          path: SRC_RESUME_PATH,
        },
      },
      {
        title: 'Read private',
        task: { process: parsePrivateIterations, do: 'private' },
      },
    ];

    getResumeLoadingTasks(context, providedTask as ListrTaskWrapper<any, any>);
    expect(lister).toHaveBeenCalledWith(expectedTasks, expect.anything());
  });
});
