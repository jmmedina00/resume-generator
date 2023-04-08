import { readFile } from 'fs/promises';
import jwt from 'jsonwebtoken';
import { Requester, getAuthorizedRequester } from '../net';
import { authorizeWithBearerToken } from '../net/auth';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

interface GoogleServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

interface GoogleAccessToken {
  access_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

const getServiceAccount = async () => {
  const data =
    process.env['GOOGLE_SERVICE_ACCOUNT'] ??
    (await readFile('./google.json', 'utf-8'));
  return JSON.parse(data) as GoogleServiceAccount;
};

export const getAuthorizedGoogle = async (): Promise<Requester> => {
  const { private_key, client_email, token_uri } = await getServiceAccount();

  const jwtPayload = { iss: client_email, aud: token_uri, scope: DRIVE_SCOPE };
  const jwtToken = jwt.sign(jwtPayload, private_key, {
    algorithm: 'RS256',
    expiresIn: 3600,
  });

  const unauthenticatedRequester = getAuthorizedRequester(() => '');
  const { access_token } = await unauthenticatedRequester<GoogleAccessToken>(
    'post',
    token_uri,
    {
      body: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
      },
    }
  );

  return getAuthorizedRequester(authorizeWithBearerToken(access_token));
};
