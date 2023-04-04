import { getAuthorizedRequester } from '../net';
import { authorizeWithBearerToken } from '../net/auth';
import { getAuthorizedGitHub } from './auth';

jest.mock('../net');
jest.mock('../net/auth');

describe('GitHub authentication', () => {
  it('Should set up authentication with Bearer token from environment', () => {
    process.env['AUTH_GITHUB'] = 'my-authorization-token';

    const authGen = jest.fn().mockReturnValue('test');
    (authorizeWithBearerToken as jest.Mock).mockReturnValue(authGen);

    const auth = getAuthorizedGitHub();
    expect(authorizeWithBearerToken).toHaveBeenCalledWith(
      'my-authorization-token'
    );
    expect(getAuthorizedRequester).toHaveBeenCalledWith(authGen);
  });
});
