import { readdirSync } from 'fs';
import { uploadFolderToDrive } from './upload';
import { uploadFile } from '../../service/gdrive';
import { initialContext } from '../context';

jest.mock('fs');
jest.mock('../../service/gdrive');

describe('Uploading tasks', () => {
  it('should create tasks and upload each file separately to Drive', async () => {
    const context = { ...initialContext };

    const path = './dist/files';
    const files = ['test.txt', 'report.pdf', 'log.json'];

    const expectedPaths = [
      './dist/files/test.txt',
      './dist/files/report.pdf',
      './dist/files/log.json',
    ];

    (readdirSync as jest.Mock).mockReturnValue(files);

    const tasks = uploadFolderToDrive(path);

    await Promise.all(tasks.map((task) => task(context)));

    for (const expectedPath of expectedPaths) {
      expect(uploadFile).toHaveBeenCalledWith(expectedPath);
    }
  });
});
