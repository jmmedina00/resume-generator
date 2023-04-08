import { getAuthorizedRequester } from '../net';
import { authorizeWithBearerToken } from '../net/auth';

const DROPBOX_TOKEN_URL = 'https://api.dropbox.com/oauth2/token';

interface DropboxAccessToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export const getAuthorizedDropbox = async () => {
  const id = process.env['AUTH_DROPBOX_ID'] || '';
  const secret = process.env['AUTH_DROPBOX_SECRET'] || '';
  const refreshToken = process.env['AUTH_DROPBOX_REFRESH'] || '';

  const unauthorized = getAuthorizedRequester(() => '');

  const { access_token }: DropboxAccessToken = await unauthorized(
    'post',
    DROPBOX_TOKEN_URL,
    {
      body: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: id,
        client_secret: secret,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return getAuthorizedRequester(authorizeWithBearerToken(access_token));
};
