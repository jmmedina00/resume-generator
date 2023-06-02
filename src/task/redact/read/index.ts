import { ListrTaskWrapper } from 'listr2';
import { RedactContext } from '../../context';
import { readLocalFile, readPrivateFile } from '../../io/read';
import { readIntoLocalState, readIntoRemoteState } from './processor';
import { getFullTaskName } from '../../io/task';

export const SRC_PRIVATE_FILE = './private.yml';

export const getRedactContextReadTasks = (
  _: RedactContext,
  task: ListrTaskWrapper<RedactContext, any>
) =>
  task.newListr(
    [
      {
        title: getFullTaskName('Read local private file', task),
        task: readLocalFile(readIntoLocalState, SRC_PRIVATE_FILE),
      },
      {
        title: getFullTaskName('Read private from Drive', task),
        task: readPrivateFile(readIntoRemoteState),
      },
    ],
    { concurrent: true }
  );
