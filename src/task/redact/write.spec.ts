import { encryptText } from '../../util/encrypt';
import { RedactContext } from '../context';
import { updatePrivateFile } from '../io/upload';
import { deleteFile, writeToFile } from '../io/write';
import { DEST_LOCAL_ENCRYPTED, getRedactFileSyncTasks } from './write';

jest.mock('../../util/encrypt');
jest.mock('../io/upload');
jest.mock('../io/write');

describe('Redact writing', () => {
  it('should generate appropriate sync tasks', () => {
    (encryptText as jest.Mock).mockReturnValue({ encrypted: true });

    (writeToFile as jest.Mock).mockImplementation((path, fn) => ({
      path,
      fn,
      action: 'write',
    }));
    (updatePrivateFile as jest.Mock).mockImplementation((path) => ({
      path,
      action: 'upload',
    }));
    (deleteFile as jest.Mock).mockImplementation((path) => ({
      path,
      action: 'delete',
    }));

    const expectedTasks = [
      {
        title: 'Write encrypted local file',
        task: {
          path: DEST_LOCAL_ENCRYPTED,
          fn: expect.anything(),
          action: 'write',
        },
      },
      {
        title: 'Upload encrypted file to Drive',
        task: {
          path: DEST_LOCAL_ENCRYPTED,
          action: 'upload',
        },
      },
      {
        title: 'Delete encrypted file',
        task: {
          path: DEST_LOCAL_ENCRYPTED,
          action: 'delete',
        },
      },
    ];

    const actualTasks = getRedactFileSyncTasks();
    expect(actualTasks).toEqual(expectedTasks);

    const writeTask = actualTasks.find(
      ({ title }) => title === 'Write encrypted local file'
    );
    const fn = (writeTask?.task as any)['fn'] as (foo: any) => string;

    const context: RedactContext = {
      localState: 'this file is up to be synced',
      remoteState: '',
    };

    const toWrite = fn(context);
    expect(toWrite).toEqual(JSON.stringify({ encrypted: true }));
    expect(encryptText).toHaveBeenCalledWith('this file is up to be synced');
  });
});
