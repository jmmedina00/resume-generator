import { format } from 'path';
import {
  removeAllFilesFromFolder,
  updateFile,
  uploadFile as uploadFileToDrive,
} from '../../service/gdrive';
import { readdirSync } from 'fs';
import { ListrTaskWrapper } from 'listr2';
import { getFullTaskName } from './task';

export const uploadFolderToDrive =
  <T>(path: string) =>
  (_: T, task: ListrTaskWrapper<T, any>) => {
    const files = readdirSync(path).map((base) => format({ base, dir: path }));
    const tasks = files.map((file) => ({
      title: getFullTaskName(file, task),
      task: async () => {
        await uploadFileToDrive(file);
      },
    }));

    return task.newListr(tasks, { concurrent: true });
  };

export const updatePrivateFile = (path: string) => async () => {
  const fileId = process.env['PRIVATE_FILE_ID'] || '';
  await updateFile(fileId, path);
};

export const clearDriveFolder = async () => {
  await removeAllFilesFromFolder();
};
