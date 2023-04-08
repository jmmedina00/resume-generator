import { createReadStream } from 'fs';
import { getAuthorizedDropbox } from './auth';
import { uploadFile } from '.';

jest.mock('./auth');
jest.mock('fs');

const DROPBOX_UPLOAD_URL = 'https://content.dropboxapi.com/2/files/upload';

describe('Dropbox uploading', () => {
  it('should upload and overwrite a file according to Dropbox spec', async () => {
    const requester = jest.fn();
    (getAuthorizedDropbox as jest.Mock).mockResolvedValue(requester);
    (createReadStream as jest.Mock).mockReturnValue('A file maybe');

    await uploadFile('./test.json');

    const expectedMetadata = {
      autorename: false,
      mode: 'overwrite',
      mute: false,
      path: '/test.json',
      strict_conflict: false,
    };

    expect(requester).toHaveBeenCalledWith('post', DROPBOX_UPLOAD_URL, {
      body: 'A file maybe',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify(expectedMetadata),
      },
    });
  });
});
