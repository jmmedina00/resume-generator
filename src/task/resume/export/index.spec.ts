import { ListrTask, ListrTaskWrapper } from 'listr2';
import { Options } from 'prettier';
import {
  getResumeToDocumentConverter,
  getResumeToPdfConverter,
} from './convert';
import { readFile } from 'fs/promises';
import {
  getPrivateVersionDescriptors,
  getPublicVersionDescriptors,
} from './descriptor';
import { getPrettierOptions, validateResumeWithSchema } from './config';
import {
  RenderContextTemplates,
  getExportTasksFromDescriptor,
} from '../../export';
import { FileDescriptor } from '../../describe';
import { getExportTasksForAllResumeVersions } from '.';
import { ResumeContext, initialContext } from '../../context';

jest.mock('fs/promises');
jest.mock('./convert');
jest.mock('./descriptor');
jest.mock('./config');
jest.mock('../../export');

describe('Resume export index', () => {
  it('should consolidate descriptors and config into list of export tasks', async () => {
    const prettierOptions: Options = { singleQuote: false, printWidth: 7 };

    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    const document = jest.fn();
    const pdf = jest.fn();

    (getResumeToDocumentConverter as jest.Mock).mockReturnValue(document);
    (getResumeToPdfConverter as jest.Mock).mockReturnValue(pdf);

    (readFile as jest.Mock).mockImplementation(
      async (path: string) =>
        ({
          './assets/navbar.html': 'Navbar',
          './assets/styles.css': 'Styles',
        }[path] || '')
    );
    (getPublicVersionDescriptors as jest.Mock).mockReturnValue([
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
    ]);
    (getPrivateVersionDescriptors as jest.Mock).mockReturnValue([
      {
        dir: 'private',
        name: 'foo',
        contents: 'bar',
      },
    ]);
    (getPrettierOptions as jest.Mock).mockResolvedValue(prettierOptions);
    (getExportTasksFromDescriptor as jest.Mock).mockImplementation(
      (
        descriptor: FileDescriptor,
        templates: RenderContextTemplates,
        validateFn: Function
      ) => ({
        templates,
        validateFn,
        ...descriptor,
      })
    );

    const expectedTasks = [
      {
        title: 'PUBLIC - version: foo, sub: le',
        task: {
          validateFn: validateResumeWithSchema,
          templates: {
            json: {
              prettierOptions,
              preprocessFn: expect.anything(),
            },
            html: {
              templateContents: 'Navbar',
              templateStyles: 'Styles',
              prettierOptions: { ...prettierOptions, parser: 'html' },
              preprocessFn: document,
            },
            pdf: {
              prettierOptions: null,
              preprocessFn: pdf,
            },
          },
          dir: 'public',
          name: 'foo',
          subversion: 'le',
          contents: 'bar',
        },
      },
      {
        title: 'PUBLIC - version: bar',
        task: {
          validateFn: validateResumeWithSchema,
          templates: {
            json: {
              prettierOptions,
              preprocessFn: expect.anything(),
            },
            html: {
              templateContents: 'Navbar',
              templateStyles: 'Styles',
              prettierOptions: { ...prettierOptions, parser: 'html' },
              preprocessFn: document,
            },
            pdf: {
              prettierOptions: null,
              preprocessFn: pdf,
            },
          },
          dir: 'publica',
          name: 'bar',
          contents: 'baz',
        },
      },
      {
        title: 'PRIVATE - version: foo',
        task: {
          validateFn: validateResumeWithSchema,
          templates: {
            json: {
              prettierOptions,
              preprocessFn: expect.anything(),
            },
            pdf: {
              prettierOptions: null,
              preprocessFn: pdf,
            },
          },
          dir: 'private',
          name: 'foo',
          contents: 'bar',
        },
      },
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
