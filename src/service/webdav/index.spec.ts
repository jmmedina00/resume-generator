import { createReadStream } from 'fs';
import { WebDAVConfig, uploadFile } from '.';
import { getAuthorizedRequester } from '../net';

jest.mock('fs');
jest.mock('../net');

describe('WebDAV uploading', () => {
  it.each([
    [
      'http://test.local',
      'path/to',
      './myfile.json',
      'http://test.local/path/to/myfile.json',
    ],
    [
      'http://file.service/public/',
      '/documents/',
      './folder/accounts.pdf',
      'http://file.service/public/documents/accounts.pdf',
    ],
    [
      'https://nextcloud.local/remote.php/dav/files/user',
      'path/to/folder/',
      './test/pictures.zip',
      'https://nextcloud.local/remote.php/dav/files/user/path/to/folder/pictures.zip',
    ],
  ])(
    'should upload contents to destination in %s plus filename with provided authorization',
    async (baseUrl, destPath, path, expected) => {
      const auth = jest.fn().mockReturnValue('Whatever');
      const requester = jest.fn();

      (createReadStream as jest.Mock).mockReturnValue('File contents');
      (getAuthorizedRequester as jest.Mock).mockReturnValue(requester);

      const config: WebDAVConfig = {
        auth,
        baseUrl,
      };

      const foo = await uploadFile(config, path, destPath);

      expect(getAuthorizedRequester).toHaveBeenCalledWith(auth);
      expect(requester).toHaveBeenCalledWith('put', expected, {
        body: 'File contents',
      });
    }
  );
});
