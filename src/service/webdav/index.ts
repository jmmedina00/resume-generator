import { basename } from 'path';
import { getAuthorizedRequester } from '../net';
import { Authorization } from '../net/auth';
import { createReadStream } from 'fs';

export interface WebDAVConfig {
  auth: Authorization;
  baseUrl: string;
}

export const uploadFile = async (
  { auth, baseUrl }: WebDAVConfig,
  path: string,
  destinationFolder: string = '.'
) => {
  const requester = getAuthorizedRequester(auth);
  const fileName = basename(path);

  const url = new URL([baseUrl, destinationFolder, fileName].join('/'));
  const sanitized =
    url.origin +
    '/' +
    url.pathname
      .split('/')
      .filter((foo) => !!foo)
      .join('/');

  return requester('put', sanitized, { body: createReadStream(path) });
};
