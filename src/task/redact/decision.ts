import { ListrTaskWrapper } from 'listr2';
import { RedactContext } from '../context';
import { getRedactFileSyncTasks } from './write';

export const STATES_EQUAL = 'States are equal. No action required'

export const evaluateContextAndDetermineNextAction = (
  ctx: RedactContext,
  task: ListrTaskWrapper<RedactContext, any>
) => {
  const { localState, remoteState } = ctx;

  const tasks =
    localState === remoteState
      ? [
          {
            title: STATES_EQUAL,
            task: async () => {},
          },
        ]
      : getRedactFileSyncTasks();

  return task.newListr(tasks);
};
