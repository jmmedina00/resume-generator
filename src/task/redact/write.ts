import { ListrTask } from 'listr2';
import { encryptText } from '../../util/encrypt';
import { RedactContext } from '../context';
import { deleteFile, writeToFile } from '../io/write';
import { updatePrivateFile } from '../io/upload';

export const DEST_LOCAL_ENCRYPTED = './private.yml.redacted';

export const getRedactFileSyncTasks = (): ListrTask<RedactContext, any>[] => {
  const encryptLocal = ({ localState }: RedactContext) =>
    JSON.stringify(encryptText(localState));

  return [
    {
      title: 'Write encrypted local file',
      task: writeToFile(DEST_LOCAL_ENCRYPTED, encryptLocal),
    },
    {
      title: 'Upload encrypted file to Drive',
      task: updatePrivateFile(DEST_LOCAL_ENCRYPTED),
    },
    {
      title: 'Delete encrypted file',
      task: deleteFile(DEST_LOCAL_ENCRYPTED),
    },
  ];
};
