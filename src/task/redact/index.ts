import { Listr } from 'listr2';
import { RedactContext } from '../context';
import { getRedactContextReadTasks } from './read';
import { evaluateContextAndDetermineNextAction } from './decision';

export const redactTasks = new Listr<RedactContext>(
  [
    { title: 'Initialize state', task: getRedactContextReadTasks },
    {
      title: 'Analyze context and act further',
      task: evaluateContextAndDetermineNextAction,
    },
  ],
  { rendererOptions: { collapseSubtasks: false } }
);
