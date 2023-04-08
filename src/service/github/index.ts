import { components } from '@octokit/openapi-types';
import { getAuthorizedGitHub } from './auth';
import { Requester } from '../net';

export interface GithubUserInfo {
  user: string;
  fullName: string;
  profileUrl: string;
  avatarUrl: string;
}

const BASE_URL = 'https://api.github.com';

const getUser = (
  requester: Requester
): Promise<components['schemas']['public-user']> =>
  requester('get', BASE_URL + '/user');

export const getCoreUserInfo = async (): Promise<GithubUserInfo> => {
  const requester = getAuthorizedGitHub();

  const { login, name, html_url, avatar_url } = await getUser(requester);
  return {
    user: login,
    fullName: name ?? '',
    profileUrl: html_url,
    avatarUrl: avatar_url,
  };
};

export const getRepoDescription = async (repo: string): Promise<string> => {
  const requester = getAuthorizedGitHub();
  const { login: owner } = await getUser(requester);

  const { description }: components['schemas']['full-repository'] =
    await requester('get', BASE_URL + `/repos/${owner}/${repo}`);

  return description ?? '';
};

export const getFileFromRepo = async (
  repo: string,
  path: string
): Promise<string> => {
  const requester = getAuthorizedGitHub();
  const { login: owner } = await getUser(requester);

  const { download_url }: components['schemas']['content-file'] =
    await requester(
      'get',
      BASE_URL + `/repos/${owner}/${repo}/contents/${path}`
    );

  return requester('get', download_url ?? '');
};
