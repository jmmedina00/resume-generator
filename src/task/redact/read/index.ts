import { ListrTaskWrapper } from 'listr2';
import { RedactContext } from '../../context';
import { readLocalFile, readPrivateFile } from '../../io/read';
import { readIntoLocalState, readIntoRemoteState } from './processor';

export const SRC_PRIVATE_FILE = './private.yml';

export const getRedactContextReadTasks = (
  _: RedactContext,
  task: ListrTaskWrapper<RedactContext, any>
) =>
  task.newListr(
    [
      {
        title: 'Read local private file',
        task: readLocalFile(readIntoLocalState, SRC_PRIVATE_FILE),
      },
      {
        title: 'Read private from Drive',
        task: readPrivateFile(readIntoRemoteState),
      },
    ],
    { concurrent: true }
  );
