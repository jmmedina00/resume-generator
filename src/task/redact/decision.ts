import { ListrTaskWrapper } from 'listr2';
import { RedactContext } from '../context';
import { getRedactFileSyncTasks } from './write';
import { getFullTaskName } from '../io/task';

export const STATES_EQUAL = 'States are equal. No action required';

export const evaluateContextAndDetermineNextAction = (
  ctx: RedactContext,
  task: ListrTaskWrapper<RedactContext, any>
) => {
  const { localState, remoteState } = ctx;

  const tasks =
    localState === remoteState
      ? [
          {
            title: getFullTaskName(STATES_EQUAL, task),
            task: async () => {},
          },
        ]
      : getRedactFileSyncTasks(); // TODO refactor this to take taskr params

  return task.newListr(tasks);
};
