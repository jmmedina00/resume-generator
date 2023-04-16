import { readFile } from 'fs/promises';
import { getCoreUserInfo } from '../service/github';
import { ResumeContext } from './context';
import { parse } from 'yaml';
import { EncryptedData, decryptText } from '../util/encrypt';
import { getFileContents } from '../service/gdrive';

export const SRC_RESUME_PATH = './resume.yml';

export const readGitHub = async (ctx: ResumeContext): Promise<void> => {
  const gitHubUser = await getCoreUserInfo();
  ctx.githubUser = gitHubUser;
};

export const readSourceResume = async (ctx: ResumeContext): Promise<void> => {
  const resumeFile = await readFile(SRC_RESUME_PATH, 'utf-8');
  const { basics, languages, projects, skills, work, education } =
    parse(resumeFile);

  ctx.incomplete = { basics, projects };
  ctx.complete = { languages, skills, work, education };
};

export const readPrivateIterations = async (
  ctx: ResumeContext
): Promise<void> => {
  const fileId = process.env['PRIVATE_FILE_ID'] || '';
  const encrypted: EncryptedData = await getFileContents(fileId);
  ctx.privateIterations = parse(decryptText(encrypted));
};
