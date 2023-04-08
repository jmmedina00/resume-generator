import { authorizeWithBearerToken } from '../net/auth';
import { getAuthorizedRequester } from '../net';

export const getAuthorizedGitHub = () => {
  const token = process.env['AUTH_GITHUB'] ?? '';
  const auth = authorizeWithBearerToken(token);
  return getAuthorizedRequester(auth);
};
