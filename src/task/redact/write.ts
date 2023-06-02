import { ListrTask, ListrTaskWrapper } from 'listr2';
import { encryptText } from '../../util/encrypt';
import { RedactContext } from '../context';
import { deleteFile, writeToFile } from '../io/write';
import { updatePrivateFile } from '../io/upload';
import { getFullTaskName } from '../io/task';

export const DEST_LOCAL_ENCRYPTED = './private.yml.redacted';

export const getRedactFileSyncTasks = (
  task: ListrTaskWrapper<RedactContext, any>
): ListrTask<RedactContext, any>[] => {
  const encryptLocal = ({ localState }: RedactContext) =>
    JSON.stringify(encryptText(localState));

  return [
    {
      title: getFullTaskName('Write encrypted local file', task),
      task: writeToFile(DEST_LOCAL_ENCRYPTED, encryptLocal),
    },
    {
      title: getFullTaskName('Upload encrypted file to Drive', task),
      task: updatePrivateFile(DEST_LOCAL_ENCRYPTED),
    },
    {
      title: getFullTaskName('Delete encrypted file', task),
      task: deleteFile(DEST_LOCAL_ENCRYPTED),
    },
  ];
};
