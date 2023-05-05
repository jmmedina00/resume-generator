import { writeFile } from 'fs/promises';
import { ResumeContext, initialContext } from './context';
import { writeToFile } from './write';

jest.mock('fs/promises');

describe('File writing', () => {
  it('should be able to read as specified by context function into designated path', async () => {
    const context: ResumeContext = {
      ...initialContext,
      incomplete: { foo: 'bar', bar: 'baz' },
    };

    const accessFn = ({ incomplete }: ResumeContext) =>
      JSON.stringify(incomplete);

    const task = writeToFile('./incomplete.json', accessFn);
    await task(context);

    expect(writeFile).toHaveBeenCalledWith(
      './incomplete.json',
      JSON.stringify({ foo: 'bar', bar: 'baz' }),
      'utf-8'
    );
  });
});
