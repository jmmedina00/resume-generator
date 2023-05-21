import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { basename, dirname, format } from 'path';

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

export const copyFileToFolder = (from: string, to: string) => async () => {
  const file = await readFile(from);

  const filename = basename(from);
  await writeFile(format({ name: filename, dir: to }), file);
};
