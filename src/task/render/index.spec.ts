import { ListrTask, ListrTaskWrapper } from 'listr2';
import { RenderContext } from '../context';
import { writeToFile } from '../io/write';
import { getFileDescriptorRenderingTasks } from '.';

jest.mock('../io/write');

describe('Rendering index', () => {
  it('should provide expected tasks to task wrapper', () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    (writeToFile as jest.Mock).mockResolvedValue(jest.fn());

    const context: RenderContext = {
      path: 'bar/baz',
      contents: 'asdf',
      prettierOptions: {},
      validateFn: jest.fn(),
    };

    const expectedTitles = [
      'Validate input',
      'Prettify input',
      'Write to file',
    ];

    const wrapper = getFileDescriptorRenderingTasks(context);
    wrapper(null, providedTask as ListrTaskWrapper<any, any>);

    const taskDescriptions = lister.mock.calls[0][0] as ListrTask<
      RenderContext,
      any
    >[];

    const titleIndexes = expectedTitles.map((title) =>
      taskDescriptions.findIndex(({ title: taskTitle }) => title === taskTitle)
    );

    expect(titleIndexes.includes(-1)).toBeFalsy();

    const sortedTitleIndexes = [...titleIndexes];
    sortedTitleIndexes.sort();

    expect(sortedTitleIndexes).toEqual(titleIndexes);

    const writeTask =
      taskDescriptions.find(({ title }) => title === 'Write to file')?.task ||
      (() => {
        throw new Error('No write task');
      });

    writeTask(context, {} as ListrTaskWrapper<any, any>);

    const [path, fn] = (writeToFile as jest.Mock).mock.calls[0];
    expect(path).toEqual('bar/baz');
    expect(fn(context)).toEqual('asdf');
  });
});
