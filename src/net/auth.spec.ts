import {
  authorizeWithBasicCredentials,
  authorizeWithBearerToken,
} from './auth';

describe('Authentication handlers', () => {
  it('should combine Bearer token as in with keyword', () => {
    const token = 'mysupertoken';
    const expected = 'Bearer mysupertoken';

    const actual = authorizeWithBearerToken(token)();
    expect(actual).toEqual(expected);
  });

  it('should combine user and password into Basic auth spec', () => {
    const user = 'juanmi';
    const password = 'mysuperpassword';

    const expected = 'Basic anVhbm1pOm15c3VwZXJwYXNzd29yZA==';

    const actual = authorizeWithBasicCredentials(user, password)();
    expect(actual).toEqual(expected);
  });
});
