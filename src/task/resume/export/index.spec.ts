import type { ListrTask, ListrTaskWrapper } from 'listr2';
import {
  getFocusedVersionDescriptors,
  getPrivateVersionDescriptors,
  getPublicVersionDescriptors,
} from './descriptor';
import { htmlYielders, jsonYielders, mdYielders, pdfYielders } from './config';
import { getDescribedPath } from '../../describe';
import { getExportTasksForAllResumeVersions } from '.';
import { ResumeContext, initialContext } from '../../context';
import { getRenderingTasks } from '../../render';
import { basename } from 'path';

jest.mock('./descriptor');
jest.mock('./config');
jest.mock('../../describe');
jest.mock('../../render');
jest.mock('../../io/task');

describe('Resume export index', () => {
  it('should consolidate descriptors and config into list of export tasks', async () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    (jsonYielders as jest.Mock).mockReturnValue({ yield: 'json' });
    (mdYielders as jest.Mock).mockReturnValue({ yield: 'md' });
    (pdfYielders as jest.Mock).mockReturnValue({ yield: 'pdf' });
    (htmlYielders as jest.Mock).mockReturnValue({ yield: 'html' });

    (getRenderingTasks as jest.Mock).mockImplementation(
      (path, src, yielders) => ({
        path,
        src,
        yielders,
      })
    );
    (getDescribedPath as jest.Mock).mockImplementation(
      (descriptor, format) => ({ descriptor, format })
    );

    const publicDescriptors = [
      {
        dir: 'public',
        name: 'foo',
        subversion: 'le',
        contents: 'bar',
      },
      {
        dir: 'publica',
        name: 'bar',
        contents: 'baz',
      },
    ];

    const focusedDescriptors = [
      {
        dir: 'public/foo',
        name: 'focus',
        contents: 'bar',
      },
      {
        dir: 'publica/bar',
        name: 'focused',
        contents: 'baz',
      },
    ];

    const privateDescriptors = [
      {
        dir: 'private',
        name: 'foo',
        contents: 'bar',
      },
    ];

    (getPublicVersionDescriptors as jest.Mock).mockReturnValue(
      publicDescriptors
    );
    (getFocusedVersionDescriptors as jest.Mock).mockReturnValue(
      focusedDescriptors
    );
    (getPrivateVersionDescriptors as jest.Mock).mockReturnValue(
      privateDescriptors
    );

    const getExpectedTask = (descriptor: any, format: string) => ({
      path: { descriptor, format },
      src: descriptor.contents,
      yielders: { yield: format },
    });

    const expectedPublicTasks = publicDescriptors.flatMap((descriptor) =>
      ['json', 'md', 'pdf', 'html'].map((format) => ({
        title:
          'PUBLIC - version: ' +
          descriptor.name +
          (descriptor.subversion ? ', sub: ' + descriptor.subversion : '') +
          ' - ' +
          format,
        task: getExpectedTask(descriptor, format),
      }))
    );

    const expectedFocusedTasks = focusedDescriptors.flatMap((descriptor) =>
      ['json', 'md'].map((format) => ({
        title:
          'FOCUSED - version: ' + basename(descriptor.dir) + ' - ' + format,
        task: getExpectedTask(descriptor, format),
      }))
    );

    const expectedPrivateTasks = privateDescriptors.flatMap((descriptor) =>
      ['json', 'pdf'].map((format) => ({
        title: 'PRIVATE - version: ' + descriptor.name + ' - ' + format,
        task: getExpectedTask(descriptor, format),
      }))
    );

    const expectedTasks: any[] = [
      ...expectedPublicTasks,
      ...expectedFocusedTasks,
      ...expectedPrivateTasks,
    ];

    await getExportTasksForAllResumeVersions(
      { ...initialContext },
      providedTask as ListrTaskWrapper<any, any>
    );

    const actualTasks = lister.mock.calls[0][0] as ListrTask<
      ResumeContext,
      any
    >[];
    expect(actualTasks).toEqual(expectedTasks);
  });
});
