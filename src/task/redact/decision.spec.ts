import { ListrTaskWrapper } from 'listr2';
import { RedactContext } from '../context';
import {
  STATES_EQUAL,
  evaluateContextAndDetermineNextAction,
} from './decision';
import { getRedactFileSyncTasks } from './write';

jest.mock('./write');

describe('Redact context decision', () => {
  it('should do "nothing" when states are equal', () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    const foo = 'test';
    const bar = 'test';

    const context: RedactContext = {
      localState: foo,
      remoteState: bar,
    };

    evaluateContextAndDetermineNextAction(
      context,
      providedTask as ListrTaskWrapper<any, any>
    );

    expect(lister).toHaveBeenCalledWith([
      { title: STATES_EQUAL, task: expect.anything() },
    ]);
  });

  it('should use sync tasks when states are not equal', () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    (getRedactFileSyncTasks as jest.Mock).mockReturnValue([
      {
        title: 'Sync files',
        task: async () => {},
      },
    ]);

    const foo = 'foo';
    const bar = 'bar';

    const context: RedactContext = {
      localState: foo,
      remoteState: bar,
    };

    evaluateContextAndDetermineNextAction(
      context,
      providedTask as ListrTaskWrapper<any, any>
    );

    expect(lister).toHaveBeenCalledWith([
      { title: 'Sync files', task: expect.anything() },
    ]);
  });
});
