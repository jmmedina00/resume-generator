import { readdirSync } from 'fs';
import {
  clearDriveFolder,
  updatePrivateFile,
  uploadFolderToDrive,
} from './upload';
import {
  removeAllFilesFromFolder,
  updateFile,
  uploadFile,
} from '../../service/gdrive';
import { initialContext } from '../context';
import { ListrTask, ListrTaskWrapper } from 'listr2';

jest.mock('fs');
jest.mock('./task');
jest.mock('../../service/gdrive');

describe('Uploading tasks', () => {
  it('should create tasks and upload each file separately to Drive', async () => {
    const context = { ...initialContext };
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
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
    const task = uploadFolderToDrive(path);
    await task(null, providedTask as ListrTaskWrapper<any, any>);
    expect(lister).toHaveBeenCalledWith(expectedTasks, expect.anything());

    const tasks = lister.mock.calls[0][0] as ListrTask<any>[];

    await Promise.all(
      tasks.map(({ task }) =>
        task(context, providedTask as ListrTaskWrapper<any, any>)
      )
    );

    for (const expectedPath of expectedPaths) {
      expect(uploadFile).toHaveBeenCalledWith(expectedPath);
    }
  });

  it('should wrap around update Drive file with private file id', async () => {
    process.env['PRIVATE_FILE_ID'] = 'file_id_goes_here';

    const task = updatePrivateFile('./private.result');
    await task();

    expect(updateFile).toHaveBeenCalledWith(
      'file_id_goes_here',
      './private.result'
    );
  });

  it('should wrap around remove all files from Drive folder', async () => {
    await clearDriveFolder();
    expect(removeAllFilesFromFolder).toHaveBeenCalled();
  });
});
