import { readFile } from 'fs/promises';
import { GithubUserInfo, getCoreUserInfo } from '../../service/github';
import {
  SRC_RESUME_PATH,
  readGitHub,
  readPrivateFile,
  readSourceResume,
} from './read';
import { parse } from 'yaml';
import { getFileContents } from '../../service/gdrive';
import { EncryptedData, decryptText } from '../../util/encrypt';

jest.mock('fs/promises');
jest.mock('../../service/github');
jest.mock('../../service/gdrive');
jest.mock('../../util/encrypt');
jest.mock('yaml');

describe('Reading tasks', () => {
  it('should read GitHub user and process it into context', async () => {
    const githubUser: GithubUserInfo = {
      user: 'juanmim',
      fullName: 'Juanmi Medina',
      profileUrl: 'this',
      avatarUrl: 'that',
    };

    const context = { foo: 'bar' };
    const process = jest.fn();

    (getCoreUserInfo as jest.Mock).mockResolvedValue({ ...githubUser });

    const task = readGitHub(process);

    await task(context);
    expect(process).toHaveBeenCalledWith(
      {
        ...githubUser,
      },
      { foo: 'bar' }
    );
  });

  it('should read and parse source resume into respective areas', async () => {
    const parsed = {
      re: 'la',
      sa: 'shi',
    };
    const process = jest.fn();
    const context = { foo: 'bar' };

    (readFile as jest.Mock).mockResolvedValue('');
    (parse as jest.Mock).mockReturnValue(parsed);

    const task = readSourceResume(process);
    await task(context);
    expect(process).toHaveBeenCalledWith(
      {
        re: 'la',
        sa: 'shi',
      },
      { foo: 'bar' }
    );

    expect(readFile).toHaveBeenCalledWith(SRC_RESUME_PATH, 'utf-8');
    expect(parse).toHaveBeenCalledWith('');
  });

  it('should read and decrypt private iterations into context', async () => {
    const processFn = jest.fn();
    const encrypted: EncryptedData = {
      initVector: 'foo',
      data: 'bar',
      authTag: 'baz',
    };

    process.env['PRIVATE_FILE_ID'] = 'my-private-file-here';

    (getFileContents as jest.Mock).mockResolvedValue(encrypted);
    (decryptText as jest.Mock).mockReturnValue('Decrypted');

    const context = { foo: 'bar' };

    const task = readPrivateFile(processFn);
    await task(context);

    expect(processFn).toHaveBeenCalledWith('Decrypted', { foo: 'bar' });
    expect(decryptText).toHaveBeenCalledWith(encrypted);
    expect(getFileContents).toHaveBeenCalledWith('my-private-file-here');
  });
});
