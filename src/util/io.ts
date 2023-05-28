import { readdir } from 'fs/promises';
import { format } from 'path';

export const getRecursiveFileList = async (path: string): Promise<string[]> => {
  const entries = await readdir(path, { withFileTypes: true });

  const fullPaths = entries.map((entry) => {
    const file = format({ dir: path, name: entry.name });
    return entry.isDirectory()
      ? getRecursiveFileList(file)
      : Promise.resolve(file);
  });

  return (await Promise.all(fullPaths)).flatMap((foo) => foo);
};
