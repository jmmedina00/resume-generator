import { mkdir, rm, writeFile } from 'fs/promises';
import { dirname } from 'path';

export type FileWriter<T> = (
  path: string,
  fn: (ctx: T) => any
) => (ctx: T) => Promise<void>;

export const writeToFile: FileWriter<any> = (path, fn) => async (ctx) => {
  const contents = fn(ctx);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents, 'utf-8');
};

export const deleteFolder = (path: string) => async () => {
  await rm(path, { recursive: true, force: true });
};
