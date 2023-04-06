import { getAuthorizedRequester } from '.';
import nock from 'nock';

describe('Web requests', () => {
  it('should be able to do unauthorized request', async () => {
    nock('http://unauthenticated.local', {
      reqheaders: { Authorization: /.+/ },
    })
      .get('/')
      .reply(500, { message: 'Bad', code: 3 });

    nock('http://unauthenticated.local')
      .get('/')
      .reply(200, { message: 'Unauthorized', code: 3 });

    const expected = { message: 'Unauthorized', code: 3 };

    const unauthorized = () => '';
    const requester = getAuthorizedRequester(unauthorized);

    const actual = await requester<typeof expected>(
      'get',
      'http://unauthenticated.local'
    );

    expect(actual).toEqual(expected);
  });

  it('should be able to do authorized request', async () => {
    nock('http://authenticated.local', {
      reqheaders: { Authorization: 'Supercalifragilisticexpialidocious' },
    })
      .post('/')
      .reply(200, { message: 'Authorized', code: 4 });

    const expected = { message: 'Authorized', code: 4 };

    const authorized = () => 'Supercalifragilisticexpialidocious';
    const requester = getAuthorizedRequester(authorized);

    const actual = await requester<typeof expected>(
      'post',
      'http://authenticated.local'
    );

    expect(actual).toEqual(expected);
  });

  it('should be able to do authorized request with extra headers', async () => {
    nock('http://authenticated.local', {
      reqheaders: {
        Authorization: 'Supercalifragilisticexpialidocious',
        Sound: 'Meow',
      },
    })
      .put('/')
      .reply(200, { message: 'Authorized', code: 3 });
    const expected = { message: 'Authorized', code: 3 };

    const authorized = () => 'Supercalifragilisticexpialidocious';
    const requester = getAuthorizedRequester(authorized);

    const actual = await requester<typeof expected>(
      'put',
      'http://authenticated.local',
      { headers: { Sound: 'Meow' } }
    );

    expect(actual).toEqual(expected);
  });

  it('should be able to receive plain text as well', async () => {
    nock('http://authenticated.local').get('/').reply(200, 'This is a test');

    const expected = 'This is a test';
    const requester = getAuthorizedRequester(() => '');

    const actual = await requester<typeof expected>(
      'get',
      'http://authenticated.local'
    );

    expect(actual).toEqual(expected);
  });

  it('should be able to do a request with query parameters', async () => {
    nock('http://test.local/')
      .get('/res')
      .query({ sort: '2', name: 'test' })
      .reply(200, 'Success');

    const expected = 'Success';
    const requester = getAuthorizedRequester(() => '');

    const actual = await requester<string>('get', 'http://test.local/res', {
      params: {
        sort: '2',
        name: 'test',
      },
    });
    expect(actual).toEqual(expected);
  });

  it('should be able to do a request with body', async () => {
    nock('http://test.local')
      .post('/res', { sort: 2, name: 'test' })
      .reply(200, 'Success');

    const expected = 'Success';
    const requester = getAuthorizedRequester(() => '');

    const actual = await requester<string>('post', 'http://test.local/res', {
      body: {
        sort: 2,
        name: 'test',
      },
    });
    expect(actual).toEqual(expected);
  });

  it('should be able to do a request with both query parameters and body', async () => {
    nock('http://test.local')
      .patch('/res', { name: 'Juan', surname: 'Medina' })
      .query({ file: 'resume.json', folder: 'documents' })
      .reply(200, 'Success');

    const expected = 'Success';
    const requester = getAuthorizedRequester(() => '');
    const actual = await requester<string>('patch', 'http://test.local/res', {
      params: { file: 'resume.json', folder: 'documents' },
      body: { name: 'Juan', surname: 'Medina' },
    });

    expect(actual).toEqual(expected);
  });
});
