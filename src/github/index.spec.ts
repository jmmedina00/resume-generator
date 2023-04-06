import { getCoreUserInfo, getFileFromRepo, getRepoDescription } from '.';
import { getAuthorizedGitHub } from './auth';

const BASE_URL = 'https://api.github.com';

jest.mock('./auth');

describe.only('GitHub data fetching', () => {
  beforeEach(() => {
    (getAuthorizedGitHub as jest.Mock).mockClear();
  });

  it('should get basic user info as plain object', async () => {
    const fakeRequester = jest.fn().mockImplementation(async (method, url) => {
      if (method === 'get' && url === BASE_URL + '/user')
        return {
          login: 'username',
          name: 'My full name',
          html_url: 'Link to profile',
          avatar_url: 'Link to pfp',
        };
      return {};
    });
    (getAuthorizedGitHub as jest.Mock).mockReturnValue(fakeRequester);

    const expected = {
      user: 'username',
      fullName: 'My full name',
      profileUrl: 'Link to profile',
      avatarUrl: 'Link to pfp',
    };

    const actual = getCoreUserInfo();
    expect(await actual).toEqual(expected);
  });

  it('should fetch info of repository owned by authenticated user', async () => {
    const fakeRequester = jest
      .fn()
      .mockImplementation(async (method, url: string, data) => {
        if (method !== 'get') return {};

        if (url === BASE_URL + '/user')
          return {
            login: 'myuser',
          };

        if (url.includes('repos')) {
          return { description: 'This is a repository' };
        }
        return {};
      });
    (getAuthorizedGitHub as jest.Mock).mockReturnValue(fakeRequester);

    const description = getRepoDescription('my-repo');
    expect(await description).toEqual('This is a repository');
    expect(fakeRequester).toHaveBeenCalledWith(
      'get',
      BASE_URL + '/repos/myuser/my-repo'
    );
  });

  it('should get file from repo info, then fetch download URL', async () => {
    const fakeRequester = jest
      .fn()
      .mockImplementation(async (method, url: string, data) => {
        if (method !== 'get') return {};

        if (url === BASE_URL + '/user')
          return {
            login: 'juanmi',
          };

        if (url.includes('repos')) {
          return { download_url: 'Download here' };
        }

        if (url === 'Download here') return 'This is my text file';
        return {};
      });
    (getAuthorizedGitHub as jest.Mock).mockReturnValue(fakeRequester);

    const file = getFileFromRepo('my-repo', 'test.md');
    expect(await file).toEqual('This is my text file');
    expect(fakeRequester).toHaveBeenCalledWith(
      'get',
      BASE_URL + '/repos/juanmi/my-repo/contents/test.md'
    );
  });
});
