import { mkdir, writeFile } from 'fs/promises';
import { ResumeContext } from '../context';
import { dirname } from 'path';

export type FileWriter = (
  path: string,
  fn: (ctx: ResumeContext) => any
) => (ctx: ResumeContext) => Promise<void>;

export const writeToFile: FileWriter = (path, fn) => async (ctx) => {
  const contents = fn(ctx);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents, 'utf-8');
};
