import { getAuthorizedRequester } from '.';
import nock from 'nock';

describe('Web requests', () => {
  it.each(['get', 'post'])(
    'should be able to do unauthorized %s',
    async (method) => {
      nock('http://unauthenticated.local', {
        reqheaders: { Authorization: /.+/ },
      })
        .get('/')
        .reply(500, { message: 'Bad', code: 3 })
        .post('/')
        .reply(500, { message: 'Bad', code: 4 });

      nock('http://unauthenticated.local')
        .get('/')
        .reply(200, { message: 'Unauthorized', code: 3 })
        .post('/')
        .reply(200, { message: 'Unauthorized', code: 4 });

      const expected = { message: 'Unauthorized', code: method.length };

      const unauthorized = () => '';
      const requester = getAuthorizedRequester(unauthorized);

      const actual = await requester[method]<typeof expected>(
        'http://unauthenticated.local'
      );

      expect(actual).toEqual(expected);
    }
  );

  it.each(['get', 'post'])(
    'should be able to do authorized %s',
    async (method) => {
      nock('http://authenticated.local', {
        reqheaders: { Authorization: 'Supercalifragilisticexpialidocious' },
      })
        .get('/')
        .reply(200, { message: 'Authorized', code: 3 })
        .post('/')
        .reply(200, { message: 'Authorized', code: 4 });

      const expected = { message: 'Authorized', code: method.length };

      const authorized = () => 'Supercalifragilisticexpialidocious';
      const requester = getAuthorizedRequester(authorized);

      const actual = await requester[method]<typeof expected>(
        'http://authenticated.local'
      );

      expect(actual).toEqual(expected);
    }
  );

  it.each(['get', 'post'])(
    'should be able to receive plain text via %s as well',
    async (method) => {
      nock('http://authenticated.local')
        .get('/')
        .reply(200, 'This is a test')
        .post('/')
        .reply(200, 'This is a test');

      const expected = 'This is a test';
      const requester = getAuthorizedRequester(() => '');

      const actual = await requester[method]<typeof expected>(
        'http://authenticated.local'
      );

      expect(actual).toEqual(expected);
    }
  );

  it('should get url with data parameters as query parameters', async () => {
    nock('http://test.local/')
      .get('/res')
      .query({ sort: '2', name: 'test' })
      .reply(200, 'Success');

    const expected = 'Success';
    const requester = getAuthorizedRequester(() => '');

    const actual = await requester.get<typeof expected>(
      'http://test.local/res',
      {
        sort: '2',
        name: 'test',
      }
    );
    expect(actual).toEqual(expected);
  });

  it('should post url with data parameters as JSON request body', async () => {
    nock('http://test.local')
      .post('/res', { sort: 2, name: 'test' })
      .reply(200, 'Success');

    const expected = 'Success';
    const requester = getAuthorizedRequester(() => '');

    const actual = await requester.post<typeof expected>(
      'http://test.local/res',
      {
        sort: 2,
        name: 'test',
      }
    );
    expect(actual).toEqual(expected);
  });
});
