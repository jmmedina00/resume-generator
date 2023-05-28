import { readFile } from 'fs/promises';
import { GithubUserInfo, getCoreUserInfo } from '../../service/github';
import { readGitHub, readPrivateFile, readLocalFile } from './read';
import { getFileContents } from '../../service/gdrive';
import { EncryptedData, decryptText } from '../../util/encrypt';

jest.mock('fs/promises');
jest.mock('../../service/github');
jest.mock('../../service/gdrive');
jest.mock('../../util/encrypt');

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

  it('should read file and get it processed', async () => {
    const process = jest.fn();
    const context = { foo: 'bar' };

    (readFile as jest.Mock).mockResolvedValue('Foo bar baz');

    const task = readLocalFile(process, './file.txt');
    await task(context);

    expect(process).toHaveBeenCalledWith('Foo bar baz', { foo: 'bar' });
    expect(readFile).toHaveBeenCalledWith('./file.txt', 'utf-8');
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
