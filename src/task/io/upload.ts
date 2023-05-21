import { format } from 'path';
import {
  removeAllFilesFromFolder,
  uploadFile as uploadFileToDrive,
} from '../../service/gdrive';
import { readdirSync } from 'fs';
import { ListrTask } from 'listr2';

export const uploadFolderToDrive = (path: string): ListrTask<any, any>[] => {
  const files = readdirSync(path).map((base) => format({ base, dir: path }));
  return files.map((file) => ({
    title: file,
    task: async () => {
      await uploadFileToDrive(file);
    },
  }));
};

export const clearDriveFolder = async () => {
  await removeAllFilesFromFolder();
};
