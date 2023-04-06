import { readFile } from 'fs/promises';
import jwt from 'jsonwebtoken';
import { getAuthorizedRequester } from '../../net';
import { getAuthorizedGoogle } from './auth';
import { authorizeWithBearerToken } from '../../net/auth';

jest.mock('fs/promises');
jest.mock('jsonwebtoken');
jest.mock('../../net');
jest.mock('../../net/auth');

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

describe('Google authentication', () => {
  const fromFile = {
    private_key: 'qwerty',
    client_email: 'account@file.local',
    token_uri: 'http://file.local',
  };

  const fromEnv = {
    private_key: 'dvorak',
    client_email: 'account@secret.local',
    token_uri: 'http://secret.local',
  };

  (readFile as jest.Mock).mockResolvedValue(JSON.stringify(fromFile));

  it('should set up requester from token provided by Google exchange', async () => {
    const expectedPayload = {
      iss: 'account@file.local',
      aud: 'http://file.local',
      scope: DRIVE_SCOPE,
    };

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
    (jwt.sign as jest.Mock).mockReturnValue('Generated token');

    const foo = await getAuthorizedGoogle();

    expect(jwt.sign).toHaveBeenCalledWith(expectedPayload, 'qwerty', {
      algorithm: 'RS256',
      expiresIn: 3600,
    });

    const firstRequester = requesterYielder.mock.results[0].value;

    expect(firstRequester).toHaveBeenCalledWith('post', 'http://file.local', {
      body: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: 'Generated token',
      },
    });
    expect(authorizeWithBearerToken).toHaveBeenCalledWith('Access here');
    expect(getAuthorizedRequester).toHaveBeenLastCalledWith(bearer);
  });

  it('should grab service account data from env when available', async () => {
    process.env['GOOGLE_SERVICE_ACCOUNT'] = JSON.stringify(fromEnv);
    const expectedPayload = {
      iss: 'account@secret.local',
      aud: 'http://secret.local',
      scope: DRIVE_SCOPE,
    };

    const requesterYielder = jest
      .fn()
      .mockImplementation((auth: () => string) =>
        jest.fn(() => {
          if (auth().length === 0) return { access_token: 'Access here' };
          return {};
        })
      );
    (getAuthorizedRequester as jest.Mock).mockImplementation(requesterYielder);

    const foo = await getAuthorizedGoogle();

    expect(jwt.sign).toHaveBeenCalledWith(expectedPayload, 'dvorak', {
      algorithm: 'RS256',
      expiresIn: 3600,
    });

    const firstRequester = requesterYielder.mock.results[0].value;

    expect(firstRequester).toHaveBeenCalledWith('post', 'http://secret.local', {
      body: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: 'Generated token',
      },
    });
  });
});
