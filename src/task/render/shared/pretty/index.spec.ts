import { ListrTaskWrapper } from 'listr2';
import {
  KEY_PRETTIER_OPTIONS,
  KEY_PRETTIFIED,
  addParserWithPrettyOptions,
  prettifyResource,
} from '.';
import { appendToObjectResource } from '../../util';
import { makeResourceFromExistingWithFn } from '../../transform';

jest.mock('../../util');
jest.mock('../../transform');
jest.mock('../../../io/task');

describe('Prettier yielders', () => {
  it('should add parser to existing Prettier options', () => {
    (appendToObjectResource as jest.Mock).mockImplementation((key, object) => ({
      key,
      object,
    }));

    const expectedTasks = [
      {
        title: 'Add html parser to Prettier options',
        task: {
          key: KEY_PRETTIER_OPTIONS,
          object: { parser: 'html' },
        },
      },
    ];

    const yielder = addParserWithPrettyOptions('html');
    const tasks = yielder({} as ListrTaskWrapper<any, any>);
    expect(tasks).toEqual(expectedTasks);
  });

  it('should apply Prettier format to resource', () => {
    (makeResourceFromExistingWithFn as jest.Mock).mockImplementation(
      (keys: any, target: any, fn: any) => ({ keys, target, fn })
    );

    const expectedTasks = [
      {
        title: 'Prettify resource daisy',
        task: {
          keys: ['daisy', KEY_PRETTIER_OPTIONS],
          target: KEY_PRETTIFIED,
          fn: expect.anything(),
        },
      },
    ];

    const yielder = prettifyResource('daisy');
    const tasks = yielder({} as ListrTaskWrapper<any, any>);
    expect(tasks).toEqual(expectedTasks);
  });
});
