import { getAuthorizedRequester } from '../net';
import { authorizeWithBearerToken } from '../net/auth';
import { getAuthorizedDropbox } from './auth';

jest.mock('../net');
jest.mock('../net/auth');

const DROPBOX_TOKEN_URL = 'https://api.dropbox.com/oauth2/token';

describe('Dropbox authentication', () => {
  it('should generate a brand-new token from Dropbox secrets for authorization', async () => {
    process.env['AUTH_DROPBOX_ID'] = 'dropbox-id-here';
    process.env['AUTH_DROPBOX_SECRET'] = 'dropbox-secret-here';
    process.env['AUTH_DROPBOX_REFRESH'] =
      'ThiswillgobeyondthetimesofTutankamon';

    const bearer = jest.fn();
    const requesterYielder = jest
      .fn()
      .mockImplementation((auth: () => string) =>
        jest.fn(() => {
          if (auth().length === 0) return { access_token: 'Access here' };
          return {};
        })
      );

    (getAuthorizedRequester as jest.Mock).mockImplementation(requesterYielder);
    (authorizeWithBearerToken as jest.Mock).mockReturnValue(bearer);

    const foo = await getAuthorizedDropbox();

    const firstRequester = requesterYielder.mock.results[0].value;
    expect(firstRequester).toHaveBeenCalledWith('post', DROPBOX_TOKEN_URL, {
      body: {
        grant_type: 'refresh_token',
        refresh_token: 'ThiswillgobeyondthetimesofTutankamon',
        client_id: 'dropbox-id-here',
        client_secret: 'dropbox-secret-here',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    expect(authorizeWithBearerToken).toHaveBeenCalledWith('Access here');
    expect(getAuthorizedRequester).toHaveBeenLastCalledWith(bearer);
  });
});
