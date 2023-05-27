import { readFile } from 'fs/promises';
import { GithubUserInfo, getCoreUserInfo } from '../../service/github';
import { parse } from 'yaml';
import { EncryptedData, decryptText } from '../../util/encrypt';
import { getFileContents } from '../../service/gdrive';

export const SRC_RESUME_PATH = './resume.yml';

export type Processor<C, D> = (data: D, context: C) => void;

export const readGitHub =
  <T>(process: Processor<T, GithubUserInfo>) =>
  async (ctx: T): Promise<void> => {
    const gitHubUser = await getCoreUserInfo();
    process(gitHubUser, ctx);
  };

export const readSourceResume =
  <T>(process: Processor<T, any>) =>
  async (ctx: T): Promise<void> => {
    const resumeFile = await readFile(SRC_RESUME_PATH, 'utf-8');
    const resume: any = parse(resumeFile);

    process(resume, ctx);
  };

export const readPrivateFile =
  <T>(processFn: Processor<T, string>) =>
  async (ctx: T): Promise<void> => {
    const fileId = process.env['PRIVATE_FILE_ID'] || '';
    const encrypted: EncryptedData = await getFileContents(fileId);
    const decrypted = decryptText(encrypted);

    processFn(decrypted, ctx);
  };
