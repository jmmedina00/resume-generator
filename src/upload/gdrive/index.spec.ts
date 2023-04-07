import { createReadStream } from 'fs';
import { getAuthorizedGoogle } from './auth';
import {
  getFileContents,
  removeAllFilesFromFolder,
  updateFile,
  uploadFile,
} from '.';
import FormData from 'form-data';

jest.mock('./auth');
jest.mock('fs');

const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files/';
const NORMAL_URL = 'https://www.googleapis.com/drive/v3/files/';

describe('Google Drive uploading', () => {
  it("should be able to provide everything in one sit to Google's liking", async () => {
    process.env['GOOGLE_DRIVE_FOLDER'] = 'Folder_goes_here';
    const requester = jest.fn().mockImplementation((method, url, data) => {});
    (createReadStream as jest.Mock).mockReturnValue('Whatever');
    (getAuthorizedGoogle as jest.Mock).mockReturnValue(requester);

    const expectedData = {
      params: {
        uploadType: 'multipart',
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const foo = await uploadFile('./test.json');
    const [method, url, data] = requester.mock.calls[0];

    const metadata = {
      filename: 'test.json',
      name: 'test.json',
      parents: ['Folder_goes_here'],
      contentType: 'application/json',
    };

    expect(method).toEqual('post');
    expect(url).toEqual(UPLOAD_URL);

    const { body, ...otherData } = data;
    expect(otherData).toEqual(expectedData);

    const expectedFormData = new FormData();
    // Boundaries have to be the same so that the results are close enough for passing
    expectedFormData.setBoundary((body as FormData).getBoundary());

    expectedFormData.append('metadata', JSON.stringify(metadata), {
      contentType: 'application/json',
    });
    expectedFormData.append('data', 'Whatever', metadata);

    expect(JSON.stringify(body)).toEqual(JSON.stringify(expectedFormData));
  });

  it('should be able to list, then call deletion of all files in a folder', async () => {
    process.env['GOOGLE_DRIVE_FOLDER'] = 'MyFolder';
    const fileIds = ['foo', 'bar', 'baz'];

    const listResponse = {
      files: fileIds.map((id) => ({
        id,
      })),
    };

    const requester = jest.fn().mockImplementation((method, url, data) => {
      if (method === 'get') return listResponse;
    });
    (getAuthorizedGoogle as jest.Mock).mockReturnValue(requester);

    const foo = await removeAllFilesFromFolder();

    expect(requester).toHaveBeenCalledWith('get', NORMAL_URL, {
      params: { q: `'MyFolder' in parents` },
    });
    fileIds.forEach((id) => {
      expect(requester).toHaveBeenCalledWith('delete', NORMAL_URL + id);
    });
  });

  it('should be able to get existing file contents', async () => {
    const id = 'foo';
    const contents = 'THis is a very complex file';

    const requester = jest.fn().mockImplementation((method, url, data) => {
      if (method === 'get') return contents;
    });
    (getAuthorizedGoogle as jest.Mock).mockReturnValue(requester);

    const result = await getFileContents(id);
    expect(result).toEqual(contents);
    expect(requester).toHaveBeenCalledWith('get', NORMAL_URL + id, {
      params: { alt: 'media' },
    });
  });

  it('should be able to update existing file contents', async () => {
    const id = 'bar';
    const fileName = './test.txt';
    const newContents = 'This is my new contents';

    const requester = jest.fn().mockImplementation((method, url, data) => {});
    (getAuthorizedGoogle as jest.Mock).mockReturnValue(requester);
    (createReadStream as jest.Mock).mockReturnValue(newContents);

    const foo = await updateFile(id, fileName);

    expect(requester).toHaveBeenCalledWith('patch', UPLOAD_URL + id, {
      params: { uploadType: 'media' },
      body: newContents,
      headers: { 'Content-Type': 'text/plain' },
    });
  });
});
