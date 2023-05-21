import { readdirSync } from 'fs';
import { clearDriveFolder, uploadFolderToDrive } from './upload';
import { removeAllFilesFromFolder, uploadFile } from '../../service/gdrive';
import { initialContext } from '../context';
import { ListrTaskWrapper } from 'listr2';

jest.mock('fs');
jest.mock('../../service/gdrive');

describe('Uploading tasks', () => {
  it('should create tasks and upload each file separately to Drive', async () => {
    const context = { ...initialContext };
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: jest.fn(),
    };

    const path = './dist/files';
    const files = ['test.txt', 'report.pdf', 'log.json'];

    const expectedPaths = [
      './dist/files/test.txt',
      './dist/files/report.pdf',
      './dist/files/log.json',
    ];

    (readdirSync as jest.Mock).mockReturnValue(files);

    const expectedTasks = [
      {
        title: './dist/files/test.txt',
        task: expect.anything(),
      },
      {
        title: './dist/files/report.pdf',
        task: expect.anything(),
      },
      {
        title: './dist/files/log.json',
        task: expect.anything(),
      },
    ];
    const tasks = uploadFolderToDrive(path);
    expect(tasks).toEqual(expectedTasks);

    await Promise.all(
      tasks.map(({ task }) =>
        task(context, providedTask as ListrTaskWrapper<any, any>)
      )
    );

    for (const expectedPath of expectedPaths) {
      expect(uploadFile).toHaveBeenCalledWith(expectedPath);
    }
  });

  it('should wrap around remove all files from Drive folder', async () => {
    await clearDriveFolder();
    expect(removeAllFilesFromFolder).toHaveBeenCalled();
  });
});
