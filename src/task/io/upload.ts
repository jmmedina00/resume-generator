import { format } from 'path';
import {
  removeAllFilesFromFolder,
  updateFile,
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

export const updatePrivateFile = (path: string) => async () => {
  const fileId = process.env['PRIVATE_FILE_ID'] || '';
  await updateFile(fileId, path);
};

export const clearDriveFolder = async () => {
  await removeAllFilesFromFolder();
};
