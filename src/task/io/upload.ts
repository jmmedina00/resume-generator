import { ResumeContext } from '../context';
import { format } from 'path';
import { uploadFile as uploadFileToDrive } from '../../service/gdrive';
import { readdirSync } from 'fs';

export const uploadFolderToDrive = (
  path: string
): ((ctx: ResumeContext) => Promise<void>)[] => {
  const files = readdirSync(path).map((base) => format({ base, dir: path }));
  return files.map((file) => async (ctx: ResumeContext) => {
    await uploadFileToDrive(file);
  });
};
