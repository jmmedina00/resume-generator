import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { ResumeContext, initialContext } from '../context';
import {
  copyFileToFolder,
  deleteFile,
  deleteFolder,
  writeToFile,
} from './write';
import { dirname } from 'path';

jest.mock('fs/promises');

describe('File writing', () => {
  it('should be able to write as specified by context function into designated path', async () => {
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

  it('should ensure directory exists before writing', async () => {
    const context: ResumeContext = {
      ...initialContext,
      incomplete: { foo: 'bar', bar: 'baz' },
    };

    const path = './foo/bar/baz.txt';
    const fn = jest.fn();

    const task = writeToFile(path, fn);
    await task(context);

    expect(mkdir).toHaveBeenCalledWith(dirname(path), { recursive: true });
  });

  it("should be able to delete a folder in the same fashion as 'rm -rf'", async () => {
    const deleter = deleteFolder('./foo');
    await deleter();

    expect(rm).toHaveBeenCalledWith('./foo', { recursive: true, force: true });
  });

  it('should be able to delete a file normally', async () => {
    const deleter = deleteFile('./file.txt');
    await deleter();

    expect(rm).toHaveBeenCalledWith('./file.txt');
  });

  it('should be able to copy a file to a folder', async () => {
    (readFile as jest.Mock).mockResolvedValue('Test');

    const copier = copyFileToFolder('./foo/baz.txt', './bar');
    await copier();

    expect(writeFile).toHaveBeenCalledWith('./bar/baz.txt', 'Test');
  });
});
