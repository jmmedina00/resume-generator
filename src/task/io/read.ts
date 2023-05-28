import { readFile } from 'fs/promises';
import { GithubUserInfo, getCoreUserInfo } from '../../service/github';
import { EncryptedData, decryptText } from '../../util/encrypt';
import { getFileContents } from '../../service/gdrive';

export type Processor<C, D> = (data: D, context: C) => void;

export const readGitHub =
  <T>(process: Processor<T, GithubUserInfo>) =>
  async (ctx: T): Promise<void> => {
    const gitHubUser = await getCoreUserInfo();
    process(gitHubUser, ctx);
  };

export const readLocalFile =
  <T>(process: Processor<T, string>, path: string) =>
  async (ctx: T): Promise<void> => {
    const resumeFile = await readFile(path, 'utf-8');

    process(resumeFile, ctx);
  };

export const readPrivateFile =
  <T>(processFn: Processor<T, string>) =>
  async (ctx: T): Promise<void> => {
    const fileId = process.env['PRIVATE_FILE_ID'] || '';
    const encrypted: EncryptedData = await getFileContents(fileId);
    const decrypted = decryptText(encrypted);

    processFn(decrypted, ctx);
  };
